
from pydantic import BaseModel, Field


class SettingsUpdate(BaseModel):
    default_low_stock_threshold: int = Field(
        ge=0,
        le=100000
    )


class SettingsResponse(BaseModel):
    default_low_stock_threshold: int
