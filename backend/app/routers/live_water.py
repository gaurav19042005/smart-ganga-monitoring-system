from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.live_water_quality import LiveWaterQuality

router = APIRouter(
    prefix="/live-water",
    tags=["Live Water Quality"],
)


# =====================================================
# Get All Live Water Data
# =====================================================

@router.get("/latest")
def get_latest_data(
    db: Session = Depends(get_db),
):
    records = (
        db.query(LiveWaterQuality)
        .order_by(LiveWaterQuality.id.asc())
        .all()
    )

    data = []

    for item in records:
        data.append(
            {
                "id": item.id,
                "station_code": item.station_code,
                "monitoring_location": item.monitoring_location,
                "state": item.state,
                "temperature": item.temperature,
                "ph": item.ph,
                "dissolved_oxygen": item.dissolved_oxygen,
                "bod": item.bod,
                "conductivity": item.conductivity,
                "nitrate": item.nitrate,
                "fecal_coliform": item.fecal_coliform,
                "total_coliform": item.total_coliform,
                "status": item.status,
            }
        )

    return {
        "status": "success",
        "total": len(data),
        "data": data,
    }


# =====================================================
# Dashboard Summary
# =====================================================

@router.get("/dashboard")
def dashboard(
    db: Session = Depends(get_db),
):
    total = db.query(LiveWaterQuality).count()

    good = (
        db.query(LiveWaterQuality)
        .filter(LiveWaterQuality.status == "Good")
        .count()
    )

    moderate = (
        db.query(LiveWaterQuality)
        .filter(LiveWaterQuality.status == "Moderate")
        .count()
    )

    poor = (
        db.query(LiveWaterQuality)
        .filter(LiveWaterQuality.status == "Poor")
        .count()
    )

    avg_ph = (
        db.query(func.avg(LiveWaterQuality.ph))
        .scalar()
    )

    avg_do = (
        db.query(
            func.avg(LiveWaterQuality.dissolved_oxygen)
        )
        .scalar()
    )

    avg_bod = (
        db.query(func.avg(LiveWaterQuality.bod))
        .scalar()
    )

    return {
        "status": "success",
        "totalStations": total,
        "waterQuality": {
            "good": good,
            "moderate": moderate,
            "poor": poor,
        },
        "averages": {
            "pH": round(avg_ph or 0, 2),
            "dissolvedOxygen": round(avg_do or 0, 2),
            "BOD": round(avg_bod or 0, 2),
        },
    }


# =====================================================
# List All Stations
# =====================================================

@router.get("/stations")
def stations(
    db: Session = Depends(get_db),
):
    records = (
        db.query(
            LiveWaterQuality.station_code,
            LiveWaterQuality.monitoring_location,
            LiveWaterQuality.state,
        )
        .order_by(
            LiveWaterQuality.station_code.asc()
        )
        .all()
    )

    return {
        "status": "success",
        "total": len(records),
        "data": [
            {
                "station_code": item.station_code,
                "monitoring_location": item.monitoring_location,
                "state": item.state,
            }
            for item in records
        ],
    }


# =====================================================
# Get Single Station
# IMPORTANT: KEEP THIS ROUTE LAST
# =====================================================

@router.get("/{station_code}")
def get_station(
    station_code: str,
    db: Session = Depends(get_db),
):
    station = (
        db.query(LiveWaterQuality)
        .filter(
            LiveWaterQuality.station_code == station_code
        )
        .first()
    )

    if not station:
        raise HTTPException(
            status_code=404,
            detail="Station not found",
        )

    return {
        "status": "success",
        "data": {
            "id": station.id,
            "station_code": station.station_code,
            "monitoring_location": station.monitoring_location,
            "state": station.state,
            "temperature": station.temperature,
            "ph": station.ph,
            "dissolved_oxygen": station.dissolved_oxygen,
            "bod": station.bod,
            "conductivity": station.conductivity,
            "nitrate": station.nitrate,
            "fecal_coliform": station.fecal_coliform,
            "total_coliform": station.total_coliform,
            "status": station.status,
        },
    }