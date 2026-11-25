
from sqlalchemy import Column, Integer, ForeignKey
from app.database.connection import Base


class OrganizationSettings(Base):
    __tablename__ = "organization_settings"

    id = Column(Integer, primary_key=True, index=True)

    organization_id = Column(
        Integer,
        ForeignKey("organizations.id"),
        unique=True,
        nullable=False
    )

    default_low_stock_threshold = Column(
        Integer,
        nullable=False,
        default=5
    )
