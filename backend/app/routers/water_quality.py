from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.water_quality import WaterQuality
from app.schemas.water_quality import (
    WaterQualityCreate,
    WaterQualityResponse
)

router = APIRouter(
    prefix="/water-quality",
    tags=["Water Quality"]
)


# ==========================
# Add Water Quality Record
# ==========================
@router.post("/add", response_model=WaterQualityResponse)
def add_water_quality(
    data: WaterQualityCreate,
    db: Session = Depends(get_db)
):

    # Water Quality Status
    status = "Good"

    if (
        data.ph < 6.5 or data.ph > 8.5 or
        data.dissolved_oxygen < 5 or
        data.turbidity > 5 or
        data.bod > 3 or
        data.cod > 25
    ):
        status = "Poor"

    water = WaterQuality(
        location=data.location,
        ph=data.ph,
        dissolved_oxygen=data.dissolved_oxygen,
        turbidity=data.turbidity,
        bod=data.bod,
        cod=data.cod,
        temperature=data.temperature,
        status=status
    )

    db.add(water)
    db.commit()
    db.refresh(water)

    return water


# ==========================
# Get All Records
# ==========================
@router.get("/all", response_model=list[WaterQualityResponse])
def get_all_records(db: Session = Depends(get_db)):
    return db.query(WaterQuality).all()


# ==========================
# Get Latest Record
# ==========================
@router.get("/latest", response_model=WaterQualityResponse)
def get_latest_record(db: Session = Depends(get_db)):
    return (
        db.query(WaterQuality)
        .order_by(WaterQuality.created_at.desc())
        .first()
    )