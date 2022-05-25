from pydantic import BaseModel


class ExportCatalogCategoryBase(BaseModel):
    id: str
    name: str
    icon: str


class ExportCatalogCategory(ExportCatalogCategoryBase):
    class Config:
        orm_mode = True


class ExportCatalogCategoryCreate(ExportCatalogCategoryBase):
    pass
