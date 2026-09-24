import json
import random
from datetime import date, timedelta
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from sqlalchemy.orm import Session
from app.models.database import SessionLocal, init_db
from app.models.map import SimulatedRegionDaily
from app.services.carbon_engine import calculate

def run():
    init_db()
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(SimulatedRegionDaily).first():
        print("Map data already seeded.")
        return

    with open('app/data/regions.json', 'r') as f:
        regions = json.load(f)

    # We need 60 days of data ending today
    today = date.today()
    days = [today - timedelta(days=i) for i in range(59, -1, -1)]

    # We fix the random seed for reproducible demo data
    random.seed(42)

    total_records = 0

    for region in regions:
        # Give each region a baseline emission rate
        region_base = random.uniform(5.0, 10.0) 
        
        for d in days:
            # We don't generate actual activities, just use carbon_engine to get 
            # realistic numbers for a set of synthetic users
            
            n_users = random.randint(10, 50)
            
            # Trend and seasonality
            # Weekend effect (lower emissions)
            is_weekend = d.weekday() >= 5
            weekend_multiplier = 0.8 if is_weekend else 1.1
            
            # Mild trend over time (decreasing slightly)
            trend_multiplier = 1.0 - ((today - d).days * 0.001)
            
            total_kg_for_day = 0.0
            
            for _ in range(n_users):
                user_kg = 0.0
                # Simulate a mix of activities for a user using the engine
                
                # 1. Travel
                if random.random() < 0.7:
                    qty = random.uniform(5, 40)
                    calc = calculate('car' if random.random() < 0.6 else 'bus', qty)
                    user_kg += calc.co2e_e4 / 10000.0
                
                # 2. Electricity
                if random.random() < 0.9:
                    qty = random.uniform(3, 15)
                    calc = calculate('electricity', qty)
                    user_kg += calc.co2e_e4 / 10000.0
                    
                # 3. Meals
                qty = random.randint(1, 3)
                calc = calculate('veg_meal' if random.random() < 0.6 else 'non_veg_meal', qty)
                user_kg += calc.co2e_e4 / 10000.0
                
                # Apply region and time modifiers
                user_kg = user_kg * weekend_multiplier * trend_multiplier * (region_base / 7.5)
                total_kg_for_day += user_kg

            kg_per_user = total_kg_for_day / n_users
            
            record = SimulatedRegionDaily(
                region_id=region["id"],
                date=d,
                kg_per_user=kg_per_user,
                n_users=n_users
            )
            db.add(record)
            total_records += 1
            
    db.commit()
    print(f"Seeded {total_records} region-day records.")
    db.close()

if __name__ == '__main__':
    run()
