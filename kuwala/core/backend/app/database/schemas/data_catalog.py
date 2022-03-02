from pydantic import BaseModel


class DataCatalogItemBase(BaseModel):
    id: str
    name: str
    logo: str


class DataCatalogItemCreate(DataCatalogItemBase):
    pass


class DataCatalogItem(DataCatalogItemBase):
    class Config:
        orm_mode = True
