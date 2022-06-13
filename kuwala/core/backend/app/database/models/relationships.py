from database.database import Base
from sqlalchemy import VARCHAR, Column, ForeignKey, Table

data_to_transformation_block_association_table = Table(
    "data_to_transformation_block_association",
    Base.metadata,
    Column("data_block_id", VARCHAR, ForeignKey("data_blocks.id")),
    Column("transformation_block_id", VARCHAR, ForeignKey("transformation_blocks.id")),
)

transformation_to_transformation_block_association_table = Table(
    "transformation_to_transformation_block_association",
    Base.metadata,
    Column("parent_id", VARCHAR, ForeignKey("transformation_blocks.id")),
    Column("child_id", VARCHAR, ForeignKey("transformation_blocks.id")),
)
