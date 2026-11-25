
from fastapi import FastAPI
from app.routes.products import router as products_router
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.settings import router as settings_router

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
app.include_router(products_router)
app.include_router(dashboard_router)
app.include_router(settings_router)