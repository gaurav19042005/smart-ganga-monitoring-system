from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class WaterQuality(Base):
    __tablename__ = "water_quality"

    id = Column(Integer, primary_key=True, index=True)

    station_code = Column(String(20), nullable=False)

    monitoring_location = Column(String(200), nullable=False)

    state = Column(String(100), nullable=False)

    year = Column(Integer)

    temperature = Column(Float)

    ph = Column(Float)

    dissolved_oxygen = Column(Float)

    bod = Column(Float)

    conductivity = Column(Float)

    nitrate = Column(Float)

    fecal_coliform = Column(Float)

    total_coliform = Column(Float)

    status = Column(String(20), default="Good")

    created_at = Column(DateTime(timezone=True), server_default=func.now())