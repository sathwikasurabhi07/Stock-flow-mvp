from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    ForeignKey,
    DateTime,
    Numeric,
    UniqueConstraint,
    func
)

from app.database.connection import Base


class Product(Base):
    __tablename__ = "products"

    __table_args__ = (
        UniqueConstraint(
            "organization_id",
            "sku",
            name="uq_product_org_sku"
        ),
    )

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

    quantity = Column(Integer, nullable=False, default=0)

    cost_price = Column(Numeric(10, 2), nullable=True)

    selling_price = Column(Numeric(10, 2), nullable=True)

    low_stock_threshold = Column(Integer, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )