import random
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.historical_water_quality import HistoricalWaterQuality
from app.models.live_water_quality import LiveWaterQuality


def calculate_status(ph, do, bod):
    if 6.5 <= ph <= 8.5 and do >= 5 and bod <= 3:
        return "Good"
    elif 6.0 <= ph <= 9.0 and do >= 4:
        return "Moderate"
    else:
        return "Poor"


def generate_live_data():

    db: Session = SessionLocal()

    stations = db.query(HistoricalWaterQuality).all()

    if not stations:
        print("❌ No historical data found.")
        db.close()
        return

    for station in stations:

        temperature = round(
            random.uniform(
                station.temperature_min,
                station.temperature_max
            ), 2
        )

        ph = round(
            random.uniform(
                station.ph_min,
                station.ph_max
            ), 2
        )

        dissolved_oxygen = round(
            random.uniform(
                station.dissolved_oxygen_min,
                station.dissolved_oxygen_max
            ), 2
        )

        bod = round(
            random.uniform(
                station.bod_min,
                station.bod_max
            ), 2
        )

        conductivity = round(
            random.uniform(
                station.conductivity_min,
                station.conductivity_max
            ), 2
        )

        nitrate = round(
            random.uniform(
                station.nitrate_min,
                station.nitrate_max
            ), 2
        )

        fecal = round(
            random.uniform(
                station.fecal_coliform_min,
                station.fecal_coliform_max
            ), 2
        )

        total = round(
            random.uniform(
                station.total_coliform_min,
                station.total_coliform_max
            ), 2
        )

        status = calculate_status(
            ph,
            dissolved_oxygen,
            bod
        )

        live = LiveWaterQuality(
            station_code=station.station_code,
            monitoring_location=station.monitoring_location,
            state=station.state,
            temperature=temperature,
            ph=ph,
            dissolved_oxygen=dissolved_oxygen,
            bod=bod,
            conductivity=conductivity,
            nitrate=nitrate,
            fecal_coliform=fecal,
            total_coliform=total,
            status=status
        )

        db.add(live)

    db.commit()

    print(f"✅ Generated {len(stations)} live records.")

    db.close()


if __name__ == "__main__":
    generate_live_data()