from relationships import (
    data_to_transformation_block_association_table,
    transformation_to_transformation_block_association_table,
)
from sqlalchemy import JSON, Boolean, Column, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import backref, relationship

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
    position_x = Column(Numeric, nullable=False)
    position_y = Column(Numeric, nullable=False)
    parent_data_blocks = relationship(
        "DataBlock",
        secondary=data_to_transformation_block_association_table,
        back_populates="children",
    )
    parent_transformation_blocks = relationship(
        "TransformationBlock",
        secondary=transformation_to_transformation_block_association_table,
        primaryjoin=transformation_to_transformation_block_association_table.c.child_id
        == id,
        secondaryjoin=transformation_to_transformation_block_association_table.c.parent_id
        == id,
        backref=backref(
            "children_transformation_blocks", cascade="all, delete", join_depth=2
        ),
        join_depth=2,
    )
