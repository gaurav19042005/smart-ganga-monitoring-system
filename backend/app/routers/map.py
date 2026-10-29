from fastapi import APIRouter, HTTPException
from pathlib import Path
import csv


router = APIRouter(
    prefix="/map",
    tags=["Map"],
)


# =====================================================
# Ganga River Dataset
# =====================================================

DATASET_PATH = (
    Path(__file__).resolve().parents[2]
    / "dataset"
    / "Indian_water_data.csv"
)


# =====================================================
# Map Locations
# =====================================================

@router.get("/locations")
def get_map_locations():

    if not DATASET_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Dataset not found: {DATASET_PATH}",
        )

    locations = {}

    try:

        with open(
            DATASET_PATH,
            "r",
            encoding="utf-8-sig",
            errors="replace",
        ) as file:

            reader = csv.DictReader(file)

            for row in reader:

                location = (
                    row.get("Location") or ""
                ).strip()

                state = (
                    row.get("State") or ""
                ).strip()

                latitude_text = (
                    row.get("Latitude") or ""
                ).strip()

                longitude_text = (
                    row.get("Longitude") or ""
                ).strip()

                if not location:
                    continue

                if not latitude_text or not longitude_text:
                    continue

                try:

                    latitude = float(latitude_text)
                    longitude = float(longitude_text)

                except ValueError:

                    continue

                # Use location + state as unique key
                key = f"{location}|{state}"

                # Keep one map marker per location
                if key not in locations:

                    locations[key] = {
                        "station_code": None,
                        "location": location,
                        "state": state,
                        "latitude": latitude,
                        "longitude": longitude,
                        "pH": None,
                        "temperature": None,
                        "dissolved_oxygen": None,
                        "bod": None,
                        "conductivity": None,
                        "nitrate": None,
                        "fecal_coliform": None,
                        "total_coliform": None,
                        "water_quality_category": None,
                    }

                # Use the current observation
                locations[key]["pH"] = row.get("pH")
                locations[key]["temperature"] = row.get(
                    "Temperature_C"
                )
                locations[key]["dissolved_oxygen"] = row.get(
                    "Dissolved_Oxygen_mg_L"
                )
                locations[key]["bod"] = row.get(
                    "BOD_mg_L"
                )
                locations[key]["conductivity"] = row.get(
                    "Conductivity_uS_cm"
                )
                locations[key]["nitrate"] = row.get(
                    "Nitrate_mg_L"
                )
                locations[key]["fecal_coliform"] = row.get(
                    "Fecal_Coliform_MPN_100mL"
                )
                locations[key]["total_coliform"] = row.get(
                    "Total_Coliform_MPN_100mL"
                )
                locations[key]["water_quality_category"] = (
                    row.get("Water_Quality_Category")
                )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to read dataset: {str(error)}",
        )

    data = list(locations.values())

    return {
        "status": "success",
        "total": len(data),
        "data": data,
    }