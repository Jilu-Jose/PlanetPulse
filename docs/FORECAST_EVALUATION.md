# Forecast Evaluation Strategy (Carbon Pulse Map)

This document outlines the evaluation strategy for the damped-trend Holt exponential smoothing model used in Phase 8B.

## 1. Backtesting Framework
We will implement a rolling-origin backtesting strategy (time series cross-validation). 
For each region:
1. Select an initial training window (e.g., 28 days).
2. Forecast $h=1$ to $h=7$ days ahead.
3. Compare the forecast to the actual held-out data.
4. Advance the training window by 1 day and repeat.

## 2. Core Metrics
- **Mean Absolute Error (MAE)**: Primary metric for business interpretability (kg CO2e deviation).
- **Mean Absolute Percentage Error (MAPE)**: To compare performance across regions with different baseline emissions.
- **Coverage Probability**: Percentage of actual observations that fall within our 95% confidence intervals (should ideally be ~95%).

## 3. Baseline Comparison
The Holt model's performance will be compared against two naive baselines:
1. **Naive Forecast (Random Walk)**: $\hat{y}_{T+h} = y_T$
2. **Seasonal Naive**: $\hat{y}_{T+h} = y_{T+h-7}$

Our model must demonstrate a statistically significant improvement over these baselines in MAE to justify its complexity.

## 4. Tooling
A dedicated script (`scripts/eval_forecast.py` - to be built) will pull historical aggregated data from the DB, run the rolling backtest, and output a markdown summary table of the metrics per region and globally.
