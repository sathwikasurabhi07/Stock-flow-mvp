
from fastapi import FastAPI

from app.routes.auth import router as auth_router


app = FastAPI(
    title="StockFlow API",
    description="Inventory Management System",
    version="1.0.0"
)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Welcome to StockFlow API",
        "status": "running"
    }


# Health check
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy"
    }


# Authentication routes
app.include_router(auth_router)
