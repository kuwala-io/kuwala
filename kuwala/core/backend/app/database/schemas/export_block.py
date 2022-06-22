from typing import List, Optional, Union

from pydantic import BaseModel, Json


class ExportBlockBase(BaseModel):
    id: str
    export_catalog_item_id: str
    data_source_id: str
    input_block_ids: List[str]
    macro_parameters: Json
    row_limit: int
    name: str
    position_x: float
    position_y: float


class ExportBlock(BaseModel):
    class Config:
        orm_mode = True


class MacroParameter(BaseModel):
    id: str
    value: Union[str, List[str]]


class ExportBlockCreate(BaseModel):
    export_catalog_item_id: str
    input_block_ids: List[str]
    macro_parameters: List[MacroParameter]
    name: str
    position_x: float
    position_y: float


class ExportBlockUpdate(BaseModel):
    name: Optional[str] = None
    macro_parameters: Optional[List[MacroParameter]] = None
    position_x: float = None
    position_y: float = None
