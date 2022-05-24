from relationships import data_to_transformation_block_association_table
from sqlalchemy import Column, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from ..database import Base


class DataBlock(Base):
    __tablename__ = "data_blocks"

    id = Column(String, primary_key=True, index=True)
    data_source_id = Column(String, ForeignKey("data_sources.id"), nullable=False)
    name = Column(String, nullable=False)
    dbt_model = Column(String, nullable=False)
    table_name = Column(String, nullable=False)
    schema_name = Column(String, nullable=True)
    dataset_name = Column(String, nullable=True)
    columns = Column(ARRAY(String), nullable=True)
    position_x = Column(Numeric, nullable=False)
    position_y = Column(Numeric, nullable=False)
    children = relationship(
        "TransformationBlock",
        secondary=data_to_transformation_block_association_table,
        back_populates="parent_data_blocks",
        cascade="all, delete",
    )
