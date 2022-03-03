from pydantic import BaseModel, Json


class DataSourceBase(BaseModel):
    id: str
    data_catalog_item_id: str
    connection_parameters: Json
    connected: bool


class DataSourceCreate(DataSourceBase):
    pass


class DataSource(DataSourceBase):
    class Config:
        orm_mode = True
