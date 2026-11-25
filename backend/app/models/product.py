from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func

from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        nullable=False,
        index=True
    )

    name = Column(String(150), nullable=False)

    sku = Column(String(100), nullable=False)

    description = Column(Text, nullable=True)

    category = Column(String(100), nullable=True)

    quantity = Column(Integer, default=0, nullable=False)

    low_stock_threshold = Column(Integer, nullable=True)

    cost_price = Column(Float, nullable=True)

    selling_price = Column(Float, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )