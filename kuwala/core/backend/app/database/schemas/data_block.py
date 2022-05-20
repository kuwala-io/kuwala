from typing import List, Optional

from pydantic import BaseModel


class DataBlockBase(BaseModel):
    id: str
    data_source_id: str
    name: str
    table_name: str
    schema_name: Optional[str] = None
    dataset_name: Optional[str] = None
    dbt_model: str
    columns: Optional[List[str]] = None
    position_x: float
    position_y: float


class DataBlock(DataBlockBase):
    class Config:
        orm_mode = True


class DataBlockCreate(BaseModel):
    data_source_id: str
    name: str
    table_name: str
    schema_name: Optional[str] = None
    dataset_name: Optional[str] = None
    columns: Optional[List[str]] = None
    position_x: float
    position_y: float


class DataBlockUpdate(BaseModel):
    name: Optional[str] = None
    columns: Optional[List[str]] = None
    position_x: float = None
    position_y: float = None
