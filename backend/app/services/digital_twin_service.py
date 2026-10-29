import random

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.historical_water_quality import HistoricalWaterQuality
from app.models.live_water_quality import LiveWaterQuality


class DigitalTwin:

    def __init__(self):
        self.db: Session = SessionLocal()

    def random_value(self, minimum, maximum):
        if minimum is None or maximum is None:
            return 0.0

        if minimum == maximum:
            return round(float(minimum), 2)

        return round(random.uniform(float(minimum), float(maximum)), 2)

    def water_status(self, ph, dissolved_oxygen, bod):
        if 6.5 <= ph <= 8.5 and dissolved_oxygen >= 5 and bod <= 3:
            return "Good"
        elif 6.0 <= ph <= 9.0 and dissolved_oxygen >= 4:
            return "Moderate"
        return "Poor"

    def update_live_data(self):

        stations = self.db.query(HistoricalWaterQuality).all()

        for station in stations:

            temperature = self.random_value(
                station.temperature_min,
                station.temperature_max
            )

            ph = self.random_value(
                station.ph_min,
                station.ph_max
            )

            dissolved_oxygen = self.random_value(
                station.dissolved_oxygen_min,
                station.dissolved_oxygen_max
            )

            bod = self.random_value(
                station.bod_min,
                station.bod_max
            )

            conductivity = self.random_value(
                station.conductivity_min,
                station.conductivity_max
            )

            nitrate = self.random_value(
                station.nitrate_min,
                station.nitrate_max
            )

            fecal = self.random_value(
                station.fecal_coliform_min,
                station.fecal_coliform_max
            )

            total = self.random_value(
                station.total_coliform_min,
                station.total_coliform_max
            )

            status = self.water_status(
                ph,
                dissolved_oxygen,
                bod
            )

            live = (
                self.db.query(LiveWaterQuality)
                .filter(
                    LiveWaterQuality.station_code == station.station_code
                )
                .first()
            )

            if live:
                live.temperature = temperature
                live.ph = ph
                live.dissolved_oxygen = dissolved_oxygen
                live.bod = bod
                live.conductivity = conductivity
                live.nitrate = nitrate
                live.fecal_coliform = fecal
                live.total_coliform = total
                live.status = status
            else:
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
                    status=status,
                )

                self.db.add(live)

        self.db.commit()
        print("✅ Live Water Quality Updated")