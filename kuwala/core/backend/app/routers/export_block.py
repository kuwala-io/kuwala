import controller.export_block.csv as export_block_csv
import controller.export_block.export_block as export_block_controller
import database.crud.export_block as crud
from database.database import get_db
from database.schemas.export_block import ExportBlockCreate, ExportBlockUpdate
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/block/export",
    tags=["export_block"],
)


@router.post("/")
def create_export_block(
    export_block_create: ExportBlockCreate,
    db: Session = Depends(get_db),
):
    (export_block_id, data_source_id) = export_block_controller.create_export_block(
        export_block=export_block_create, db=db
    )
    export_block = crud.create_export_block(
        db=db,
        export_block=export_block_create,
        data_source_id=data_source_id,
        generated_id=export_block_id,
    )

    return export_block


@router.put("/{export_block_id}")
def update_export_block(
    export_block_id: str,
    export_block_update: ExportBlockUpdate,
    db: Session = Depends(get_db),
):
    return export_block_controller.update_export_block(
        export_block_id=export_block_id,
        export_block=export_block_update,
        db=db,
    )


@router.get("/{export_block_id}/trigger")
def trigger_download(
    export_block_id: str,
    db: Session = Depends(get_db),
):
    file_path, file_name, media_type = export_block_csv.download_as_csv(
        export_block_id=export_block_id, db=db
    )

    return FileResponse(path=file_path, media_type=media_type, filename=file_name)
