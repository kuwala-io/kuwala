from sqlalchemy import JSON, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.mutable import MutableList

from ..database import Base


class ExportCatalogItem(Base):
    __tablename__ = "export_catalog_items"

    id = Column(String, primary_key=True, index=True)
    category = Column(String, ForeignKey("export_catalog_categories.id"))
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    description = Column(String, nullable=False)
    min_number_of_input_blocks = Column(Integer, nullable=False)
    max_number_of_input_blocks = Column(Integer, nullable=False)
    macro_parameters = Column(MutableList.as_mutable(JSON), nullable=False)
