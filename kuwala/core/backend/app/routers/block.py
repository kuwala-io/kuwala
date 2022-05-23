import controller.block_controller as block_controller
from database.database import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/block",
    tags=["block"],
)


@router.get("/")
def get_all_blocks(
    db: Session = Depends(get_db),
):
    return block_controller.get_all_blocks(db=db)
