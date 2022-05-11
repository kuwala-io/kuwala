from typing import List, Optional, Union

from pydantic import BaseModel, Json


class TransformationBlockBase(BaseModel):
    id: str
    transformation_catalog_item_id: str
    data_source_id: str
    input_block_ids: List[str]
    macro_parameters: Json
    name: str
    columns: List[str]
    materialize_as_table: bool


class TransformationBlock(TransformationBlockBase):
    class Config:
        orm_mode = True


class MacroParameter(BaseModel):
    id: str
    value: Union[str, List[str]]


class TransformationBlockCreate(BaseModel):
    transformation_catalog_item_id: str
    input_block_ids: List[str]
    macro_parameters: List[MacroParameter]
    name: str
    materialize_as_table: bool


class TransformationBlockUpdate(BaseModel):
    columns: Optional[List[str]] = None
