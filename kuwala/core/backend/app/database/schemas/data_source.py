from typing import Optional

from pydantic import BaseModel, Json


class DataSourceBase(BaseModel):
    id: str
    data_catalog_item_id: str
    connection_parameters: Json
    connected: bool


class DataSource(DataSourceBase):
    class Config:
        orm_mode = True


class DataSourceCreate(BaseModel):
    data_catalog_item_id: str
    connection_parameters: Json
    connected: bool


class DataSourceConnection(BaseModel):
    id: str
    connection_parameters: Json


class CredentialsJson(BaseModel):
    type: str
    project_id: str
    private_key_id: str
    private_key: str
    client_email: str
    client_id: str
    auth_uri: str
    token_uri: str
    auth_provider_x509_cert_url: str
    client_x509_cert_url: str


class ConnectionParameters(BaseModel):
    host: Optional[str] = None
    port: Optional[int] = None
    user: Optional[str] = None
    password: Optional[str] = None
    database: Optional[str] = None
    credentials_json: Optional[CredentialsJson] = None
