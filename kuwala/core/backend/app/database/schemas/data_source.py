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


class ConnectionParameters(BaseModel):
    host: str | None = None
    port: int | None = None
    user: str | None = None
    password: str | None = None
    database: str | None = None
