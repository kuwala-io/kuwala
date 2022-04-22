from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import ARRAY

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
