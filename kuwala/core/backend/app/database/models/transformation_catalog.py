from sqlalchemy import JSON, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.mutable import MutableList

from ..database import Base


class TransformationCatalogItem(Base):
    __tablename__ = "transformation_catalog_items"

    id = Column(String, primary_key=True, index=True)
    category = Column(String, ForeignKey("transformation_catalog_categories.id"))
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    description = Column(String, nullable=False)
    required_column_types = Column(ARRAY(String), nullable=False)
    optional_column_types = Column(ARRAY(String), nullable=False)
    min_number_of_input_blocks = Column(Integer, nullable=False)
    max_number_of_input_blocks = Column(Integer, nullable=False)
    macro_parameters = Column(MutableList.as_mutable(JSON), nullable=False)
    examples_before = Column(JSON, nullable=False)
    examples_after = Column(JSON, nullable=False)
