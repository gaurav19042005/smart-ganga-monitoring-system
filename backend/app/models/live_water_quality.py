from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func

from app.database import Base


class LiveWaterQuality(Base):
    __tablename__ = "live_water_quality"

    id = Column(Integer, primary_key=True, index=True)

    station_code = Column(String(20))

    monitoring_location = Column(String(200))

    state = Column(String(100))

    # ==========================
    # Map Coordinates
    # ==========================
    latitude = Column(Float, nullable=True)

    longitude = Column(Float, nullable=True)

    # ==========================
    # Water Quality Parameters
    # ==========================
    temperature = Column(Float)

    ph = Column(Float)

    dissolved_oxygen = Column(Float)

    bod = Column(Float)

    conductivity = Column(Float)

    nitrate = Column(Float)

    fecal_coliform = Column(Float)

    total_coliform = Column(Float)

    status = Column(String(20))

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )