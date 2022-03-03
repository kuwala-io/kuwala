from pydantic import BaseModel, Json


class DataCatalogItemBase(BaseModel):
    id: str
    name: str
    logo: str
    connection_parameters: Json


class DataCatalogItemCreate(DataCatalogItemBase):
    pass


class DataCatalogItem(DataCatalogItemBase):
    class Config:
        orm_mode = True
