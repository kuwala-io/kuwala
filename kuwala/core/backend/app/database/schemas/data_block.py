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


class DataBlockUpdate(BaseModel):
    name: Optional[str] = None
    columns: Optional[List[str]] = None
