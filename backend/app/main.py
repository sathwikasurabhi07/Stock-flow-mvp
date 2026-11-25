
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.products import router as products_router
from app.routes.dashboard import router as dashboard_router
from app.routes.settings import router as settings_router


app = FastAPI(
    title="StockFlow API",
    description="Inventory Management System",
    version="1.0.0"
)


# CORS Configuration: Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def root():
    return {
        "message": "Welcome to StockFlow API",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }


# Register API routers
app.include_router(auth_router)
app.include_router(products_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
