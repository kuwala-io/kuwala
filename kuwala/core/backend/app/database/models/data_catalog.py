from sqlalchemy import JSON, Column, String

from ..database import Base


class DataCatalogItem(Base):
    __tablename__ = "data_catalog_items"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    logo = Column(String, nullable=False)
    connection_parameters = Column(JSON, nullable=False)
