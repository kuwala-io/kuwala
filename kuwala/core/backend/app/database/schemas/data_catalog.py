from typing import List

from pydantic import BaseModel, Json


class DataCatalogItemBase(BaseModel):
    id: str
    name: str
    logo: str
    connection_parameters: Json


class DataCatalogItem(DataCatalogItemBase):
    class Config:
        orm_mode = True


class DataCatalogItemCreate(DataCatalogItemBase):
    pass


class DataCatalogSelect(BaseModel):
    item_ids: List[str]
