from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    sku: str = Field(min_length=1, max_length=100)

    description: Optional[str] = None

    quantity: int = Field(default=0, ge=0)

    cost_price: Optional[Decimal] = Field(
        default=None,
        ge=0
    )

    selling_price: Optional[Decimal] = Field(
        default=None,
        ge=0
    )

    low_stock_threshold: Optional[int] = Field(
        default=None,
        ge=0
    )


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    sku: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    description: Optional[str] = None
    quantity: Optional[int] = Field(default=None, ge=0)
    cost_price: Optional[Decimal] = Field(default=None, ge=0)
    selling_price: Optional[Decimal] = Field(default=None, ge=0)

    low_stock_threshold: Optional[int] = Field(
        default=None,
        ge=0
    )


class ProductResponse(BaseModel):
    id: int
    organization_id: int
    name: str
    sku: str
    description: Optional[str]
    quantity: int
    cost_price: Optional[Decimal]
    selling_price: Optional[Decimal]
    low_stock_threshold: Optional[int]

    model_config = {
        "from_attributes": True
    }