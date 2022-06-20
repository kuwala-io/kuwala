from sqlalchemy import JSON, Column, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.mutable import MutableList

from ..database import Base


class ExportBlock(Base):
    __tablename__ = "export_blocks"

    id = Column(String, primary_key=True, index=True)
    export_catalog_item_id = Column(
        String, ForeignKey("export_catalog_items.id"), nullable=False
    )
    data_source_id = Column(String, ForeignKey("data_sources.id"), nullable=False)
    input_block_ids = Column(ARRAY(String))
    macro_parameters = Column(MutableList.as_mutable(JSON), nullable=False)
    name = Column(String, nullable=False)
    position_x = Column(Numeric, nullable=False)
    position_y = Column(Numeric, nullable=False)
