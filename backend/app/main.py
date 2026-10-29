from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.database import Base, engine

# =====================================================
# MODELS
# =====================================================

from app.models.user import User
from app.models.water_quality import WaterQuality
from app.models.historical_water_quality import HistoricalWaterQuality
from app.models.live_water_quality import LiveWaterQuality


# =====================================================
# ROUTERS
# =====================================================

from app.routers.auth import router as auth_router
from app.routers.water_quality import router as water_quality_router
from app.routers.live_water import router as live_water_router
from app.routers.map import router as map_router

# =====================================================
# SCHEDULER
# =====================================================

from app.simulation.scheduler import start_scheduler


# =====================================================
# FASTAPI APPLICATION
# =====================================================

app = FastAPI(
    title="Smart Ganga Monitoring API",
    version="1.0.0",
    description="AI Powered Smart Ganga Monitoring System",
)


# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================
# DATABASE
# =====================================================

Base.metadata.create_all(bind=engine)


# =====================================================
# REGISTER ROUTERS
# =====================================================

app.include_router(auth_router)

app.include_router(water_quality_router)

app.include_router(live_water_router)
app.include_router(map_router)

# =====================================================
# DEBUG ROUTER REGISTRATION
# =====================================================

print("==============================================")
print("🌊 SMART GANGA API")
print("==============================================")

print("Live Water Router:")
print(
    [
        getattr(route, "path", None)
        for route in live_water_router.routes
    ]
)

print("Application Routes:")

for route in app.routes:
    path = getattr(route, "path", None)

    if path:
        print(path)

print("==============================================")


# =====================================================
# CUSTOM OPENAPI
# =====================================================

def custom_openapi():

    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    openapi_schema.setdefault(
        "components",
        {}
    )

    openapi_schema["components"][
        "securitySchemes"
    ] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }

    protected_routes = [
        "/auth/profile",
        "/water-quality/add",
    ]

    for route in protected_routes:

        if route in openapi_schema["paths"]:

            for method in openapi_schema["paths"][route]:

                openapi_schema["paths"][route][method][
                    "security"
                ] = [
                    {
                        "BearerAuth": []
                    }
                ]

    app.openapi_schema = openapi_schema

    return app.openapi_schema


app.openapi = custom_openapi


# =====================================================
# STARTUP
# =====================================================

@app.on_event("startup")
def startup_event():

    print(
        "🚀 Starting Smart Ganga Monitoring API..."
    )

    start_scheduler()


# =====================================================
# HOME
# =====================================================

@app.get("/")
def home():

    return {
        "status": "success",
        "message": "Smart Ganga Monitoring API Running 🚀",
        "version": "1.0.0",
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
def health():

    return {
        "server": "Running",
        "database": "Connected",
        "status": "Healthy",
    }