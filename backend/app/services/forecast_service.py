"""app/services/forecast_service.py
Deterministic forecasting using Damped-trend Holt exponential smoothing with additive seasonality.
"""
import math

def forecast_region(dates: list, values: list, horizon: int = 7):
    """
    Given a daily timeseries (sorted by date), forecast `horizon` days ahead.
    Returns list of dicts: [{"offset": h, "point": float, "lower": float, "upper": float, "confidence": str}]
    where offset 0 is today, 1 is tomorrow, etc. (Since the actuals end yesterday).
    """
    n = len(values)
    
    if n < 14:
        # Fallback to mean
        mean_val = sum(values) / max(1, n)
        std_val = math.sqrt(sum((x - mean_val)**2 for x in values) / max(1, n-1)) if n > 1 else mean_val * 0.2
        return [
            {
                "offset": h,
                "point": round(mean_val, 2),
                "lower": max(0, round(mean_val - 1.96 * std_val * math.sqrt(h + 1), 2)),
                "upper": round(mean_val + 1.96 * std_val * math.sqrt(h + 1), 2),
                "confidence": "low"
            } for h in range(horizon + 1)
        ]
        
    use_seasonality = n >= 28
    season_length = 7
    
    # Grid search for best alpha, beta, gamma, phi
    best_params = None
    best_sse = float('inf')
    
    alphas = [0.1, 0.3, 0.5, 0.7, 0.9]
    betas = [0.05, 0.1, 0.2]
    gammas = [0.1, 0.3, 0.5] if use_seasonality else [0.0]
    phis = [0.8, 0.9, 0.95]
    
    # Initialize seasonal indices if used
    seasonal = [0.0] * season_length
    if use_seasonality:
        # compute initial seasonal indices using classical decomposition over the first few weeks
        num_weeks = n // season_length
        for i in range(season_length):
            idx_vals = [values[j * season_length + i] for j in range(num_weeks)]
            seasonal[i] = sum(idx_vals) / num_weeks
        mean_s = sum(seasonal) / season_length
        seasonal = [s - mean_s for s in seasonal]
        
    for alpha in alphas:
        for beta in betas:
            for gamma in gammas:
                for phi in phis:
                    sse = 0.0
                    
                    # Init level and trend
                    level = values[0]
                    if use_seasonality:
                        level = values[0] - seasonal[0]
                    trend = (values[1] - values[0]) if n > 1 else 0.0
                    
                    s_indices = seasonal.copy()
                    
                    for i in range(1, n):
                        actual = values[i]
                        s_idx = s_indices[i % season_length] if use_seasonality else 0.0
                        
                        forecast = level + phi * trend + s_idx
                        error = actual - forecast
                        sse += error * error
                        
                        prev_level = level
                        level = alpha * (actual - s_idx) + (1 - alpha) * (level + phi * trend)
                        trend = beta * (level - prev_level) + (1 - beta) * phi * trend
                        
                        if use_seasonality:
                            s_indices[i % season_length] = gamma * (actual - level) + (1 - gamma) * s_idx
                            
                    if sse < best_sse:
                        best_sse = sse
                        best_params = (alpha, beta, gamma, phi, level, trend, s_indices)
                        
    alpha, beta, gamma, phi, last_level, last_trend, last_seasonal = best_params
    
    # Compute residual std
    residual_std = math.sqrt(best_sse / n)
    
    # Forecast
    results = []
    confidence = "high" if use_seasonality else "medium"
    
    for h in range(horizon + 1):
        # h=0 is "today", h=1 is tomorrow. 
        # Since 'values' is up to yesterday, h=0 is 1 step ahead.
        steps_ahead = h + 1
        
        # Damped trend sum
        trend_component = last_trend * sum(phi**k for k in range(1, steps_ahead + 1))
        
        s_idx = last_seasonal[(n - 1 + steps_ahead) % season_length] if use_seasonality else 0.0
        
        point = last_level + trend_component + s_idx
        
        margin = 1.96 * residual_std * math.sqrt(steps_ahead)
        lower = max(0.0, point - margin)
        upper = point + margin
        
        results.append({
            "offset": h,
            "point": round(point, 2),
            "lower": round(lower, 2),
            "upper": round(upper, 2),
            "confidence": confidence
        })
        
    return results

