from sqlalchemy import JSON, Boolean, Column, ForeignKey, String
from sqlalchemy.ext.mutable import MutableList

from ..database import Base


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String, primary_key=True, index=True)
    data_catalog_item_id = Column(String, ForeignKey("data_catalog_items.id"))
    connection_parameters = Column(MutableList.as_mutable(JSON), nullable=False)
    connected = Column(Boolean, nullable=False)
