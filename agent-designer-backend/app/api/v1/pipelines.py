from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.pipeline import PipelineCreate, PipelineUpdate, PipelineStatusUpdate, PipelineResponse, PipelineListResponse
from app.services.pipeline_service import (
    list_pipelines, count_pipelines, get_pipeline,
    create_pipeline, update_pipeline_status, delete_pipeline,
)

router = APIRouter(prefix="/pipelines", tags=["pipelines"])


@router.get("", response_model=PipelineListResponse)
async def list_pipelines_endpoint(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    items = await list_pipelines(db, skip=skip, limit=limit)
    total = await count_pipelines(db)
    return PipelineListResponse(items=items, total=total)


@router.post("", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
async def create_pipeline_endpoint(
    data: PipelineCreate,
    db: AsyncSession = Depends(get_db),
):
    return await create_pipeline(db, data)


@router.get("/{pipeline_id}", response_model=PipelineResponse)
async def get_pipeline_endpoint(pipeline_id: str, db: AsyncSession = Depends(get_db)):
    return await get_pipeline(db, pipeline_id)


@router.put("/{pipeline_id}", response_model=PipelineResponse)
async def update_pipeline_endpoint(
    pipeline_id: str,
    data: PipelineUpdate,
    db: AsyncSession = Depends(get_db),
):
    pipeline = await get_pipeline(db, pipeline_id)
    if data.name is not None:
        pipeline.name = data.name
    if data.description is not None:
        pipeline.description = data.description
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


@router.put("/{pipeline_id}/status", response_model=PipelineResponse)
async def update_pipeline_status_endpoint(
    pipeline_id: str,
    data: PipelineStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await update_pipeline_status(db, pipeline_id, data)


@router.post("/{pipeline_id}/deploy", response_model=PipelineResponse)
async def deploy_pipeline_endpoint(pipeline_id: str, db: AsyncSession = Depends(get_db)):
    """Create K8s Deployment + Service in vibe-agents and wire Ingress in aipns."""
    from app.services.k8s_service import deploy_pipeline
    pipeline = await get_pipeline(db, pipeline_id)
    try:
        deploy_pipeline(pipeline)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"K8s deploy failed: {exc}") from exc
    pipeline.status = "running"
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


@router.delete("/{pipeline_id}/deployment", response_model=PipelineResponse)
async def undeploy_pipeline_endpoint(pipeline_id: str, db: AsyncSession = Depends(get_db)):
    """Remove K8s resources and mark pipeline stopped."""
    from app.services.k8s_service import undeploy_pipeline
    pipeline = await get_pipeline(db, pipeline_id)
    try:
        undeploy_pipeline(pipeline)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"K8s undeploy failed: {exc}") from exc
    pipeline.status = "stopped"
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pipeline_endpoint(pipeline_id: str, db: AsyncSession = Depends(get_db)):
    await delete_pipeline(db, pipeline_id)
