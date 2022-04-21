from typing import List, Union

from pydantic import BaseModel, Json


class TransformationBlockBase(BaseModel):
    id: str
    transformation_catalog_item_id: str
    data_source_id: str
    input_block_ids: List[str]
    macro_parameters: Json
    name: str


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
