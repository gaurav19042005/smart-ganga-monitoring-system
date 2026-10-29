import pandas as pd

from app.database import SessionLocal
from app.models.historical_water_quality import HistoricalWaterQuality

# =====================================================
# CSV File Path
# =====================================================
CSV_FILE = "datasets/Indian_water_data.csv"


def safe_float(value):
    try:
        if pd.isna(value):
            return 0.0
        return float(value)
    except:
        return 0.0


def safe_int(value):
    try:
        if pd.isna(value):
            return 0
        return int(value)
    except:
        return 0


def import_data():

    print("📂 Reading CSV...")

    df = pd.read_csv(CSV_FILE)

    # -------------------------------------------------
    # Normalize column names
    # -------------------------------------------------
    df.columns = (
        df.columns
        .str.strip()
        .str.replace("¬", "", regex=False)
        .str.replace("µ", "u", regex=False)
        .str.replace("-Max", "- Max", regex=False)
        .str.replace("-Min", "- Min", regex=False)
        .str.replace("  ", " ", regex=False)
    )

    print("\nNormalized Columns:\n")
    print(df.columns.tolist())

    db = SessionLocal()

    imported = 0

    for _, row in df.iterrows():

        record = HistoricalWaterQuality(

            station_code=str(row["STN code"]),

            monitoring_location=str(row["Monitoring Location"]),

            state=str(row["State Name"]),

            year=safe_int(row["Year"]),

            temperature_min=safe_float(row["Temperature (C) - Min"]),
            temperature_max=safe_float(row["Temperature (C) - Max"]),

            ph_min=safe_float(row["pH - Min"]),
            ph_max=safe_float(row["pH - Max"]),

            dissolved_oxygen_min=safe_float(row["Dissolved - Min"]),
            dissolved_oxygen_max=safe_float(row["Dissolved - Max"]),

            bod_min=safe_float(row["BOD (mg/L) - Min"]),
            bod_max=safe_float(row["BOD (mg/L) - Max"]),

            conductivity_min=safe_float(
                row["Conductivity (umho/cm) - Min"]
            ),
            conductivity_max=safe_float(
                row["Conductivity (umho/cm) - Max"]
            ),

            nitrate_min=safe_float(
                row["NitrateN (mg/L) - Min"]
            ),
            nitrate_max=safe_float(
                row["NitrateN (mg/L) - Max"]
            ),

            fecal_coliform_min=safe_float(
                row["Fecal Coliform (MPN/100ml) - Min"]
            ),
            fecal_coliform_max=safe_float(
                row["Fecal Coliform (MPN/100ml) - Max"]
            ),

            total_coliform_min=safe_float(
                row["Total Coliform (MPN/100ml) - Min"]
            ),
            total_coliform_max=safe_float(
                row["Total Coliform (MPN/100ml) - Max"]
            )
        )

        db.add(record)
        imported += 1

    db.commit()
    db.close()

    print("\n================================")
    print(f"✅ Imported {imported} records")
    print("================================")


if __name__ == "__main__":
    import_data()