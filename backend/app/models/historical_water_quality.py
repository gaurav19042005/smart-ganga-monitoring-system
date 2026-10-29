from sqlalchemy import Column, Integer, Float, String
from app.database import Base


class HistoricalWaterQuality(Base):
    __tablename__ = "historical_water_quality"

    id = Column(Integer, primary_key=True, index=True)

    station_code = Column(String(20))

    monitoring_location = Column(String(200))

    state = Column(String(100))

    year = Column(Integer)

    temperature_min = Column(Float)
    temperature_max = Column(Float)

    ph_min = Column(Float)
    ph_max = Column(Float)

    dissolved_oxygen_min = Column(Float)
    dissolved_oxygen_max = Column(Float)

    bod_min = Column(Float)
    bod_max = Column(Float)

    conductivity_min = Column(Float)
    conductivity_max = Column(Float)

    nitrate_min = Column(Float)
    nitrate_max = Column(Float)

    fecal_coliform_min = Column(Float)
    fecal_coliform_max = Column(Float)

    total_coliform_min = Column(Float)
    total_coliform_max = Column(Float)