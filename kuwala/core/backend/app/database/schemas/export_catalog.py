from typing import List

from pydantic import BaseModel, Json


class ExportCatalogItemBase(BaseModel):
    id: str
    category: str
    name: str
    icon: str
    description: str
    min_number_of_input_blocks: int
    max_number_of_input_blocks: int
    macro_parameters: Json


class ExportCatalogItem(ExportCatalogItemBase):
    class Config:
        orm_mode = True


class ExportCatalogItemCreate(ExportCatalogItemBase):
    pass
