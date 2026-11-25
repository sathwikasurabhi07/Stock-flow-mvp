
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.organization_settings import OrganizationSettings
from app.schemas.settings import SettingsUpdate, SettingsResponse

router = APIRouter(
    prefix="/api/settings",
    tags=["Settings"]
)


@router.get("/", response_model=SettingsResponse)
def get_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(OrganizationSettings).filter(
        OrganizationSettings.organization_id == current_user.organization_id
    ).first()

    if not settings:
        settings = OrganizationSettings(
            organization_id=current_user.organization_id,
            default_low_stock_threshold=5
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.put("/", response_model=SettingsResponse)
def update_settings(
    settings_data: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    settings = db.query(OrganizationSettings).filter(
        OrganizationSettings.organization_id == current_user.organization_id
    ).first()

    if not settings:
        settings = OrganizationSettings(
            organization_id=current_user.organization_id,
            default_low_stock_threshold=settings_data.default_low_stock_threshold
        )
        db.add(settings)
    else:
        settings.default_low_stock_threshold = (
            settings_data.default_low_stock_threshold
        )

    db.commit()
    db.refresh(settings)

    return settings
