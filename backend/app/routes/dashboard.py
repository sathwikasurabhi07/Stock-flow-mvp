from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.product import Product
from app.models.user import User
from app.models.organization_settings import OrganizationSettings

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    organization_id = current_user.organization_id

    products = (
        db.query(Product)
        .filter(Product.organization_id == organization_id)
        .all()
    )

    settings = (
        db.query(OrganizationSettings)
        .filter(
            OrganizationSettings.organization_id == organization_id
        )
        .first()
    )

    default_threshold = (
        settings.default_low_stock_threshold if settings else 5
    )

    low_stock_products = []

    for product in products:
        threshold = (
            product.low_stock_threshold
            if product.low_stock_threshold is not None
            else default_threshold
        )

        if product.quantity <= threshold:
            low_stock_products.append(product)

    return {
        "total_products": len(products),
        "total_quantity": sum(p.quantity for p in products),
        "low_stock_count": len(low_stock_products),
        "low_stock_products": low_stock_products
    }