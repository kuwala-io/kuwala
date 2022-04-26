from sqlalchemy import JSON, Boolean, Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.mutable import MutableList

from ..database import Base


class TransformationBlock(Base):
    __tablename__ = "transformation_blocks"

    id = Column(String, primary_key=True, index=True)
    transformation_catalog_item_id = Column(
        String, ForeignKey("transformation_catalog_items.id"), nullable=False
    )
    data_source_id = Column(String, ForeignKey("data_sources.id"), nullable=False)
    input_block_ids = Column(ARRAY(String))
    macro_parameters = Column(MutableList.as_mutable(JSON), nullable=False)
    name = Column(String, nullable=False)
    columns = Column(ARRAY(String), nullable=False)
    dbt_model = Column(String, nullable=False)
    materialize_as_table = Column(Boolean, default=False)
