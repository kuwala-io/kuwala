from sqlalchemy import Column, String

from ..database import Base


class TransformationCatalogCategory(Base):
    __tablename__ = "transformation_catalog_categories"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
