from pydantic import BaseModel
from datetime import datetime


class WaterQualityCreate(BaseModel):

    station_code: str

    monitoring_location: str

    state: str

    year: int

    temperature: float

    ph: float

    dissolved_oxygen: float

    bod: float

    conductivity: float

    nitrate: float

    fecal_coliform: float

    total_coliform: float


class WaterQualityResponse(BaseModel):

    id: int

    station_code: str

    monitoring_location: str

    state: str

    year: int

    temperature: float

    ph: float

    dissolved_oxygen: float

    bod: float

    conductivity: float

    nitrate: float

    fecal_coliform: float

    total_coliform: float

    status: str

    created_at: datetime

    class Config:
        from_attributes = True