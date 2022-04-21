from pydantic import BaseModel


class TransformationCatalogCategoryBase(BaseModel):
    id: str
    name: str
    icon: str


class TransformationCatalogCategory(TransformationCatalogCategoryBase):
    class Config:
        orm_mode = True


class TransformationCatalogCategoryCreate(TransformationCatalogCategoryBase):
    pass
