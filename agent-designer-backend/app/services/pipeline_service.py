import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.pipeline import Pipeline
from app.models.flow import Flow
from app.schemas.pipeline import PipelineCreate, PipelineStatusUpdate


async def list_pipelines(db: AsyncSession, skip: int = 0, limit: int = 50) -> list[Pipeline]:
    result = await db.execute(select(Pipeline).offset(skip).limit(limit))
    return list(result.scalars().all())


async def count_pipelines(db: AsyncSession) -> int:
    result = await db.execute(select(func.count()).select_from(Pipeline))
    return result.scalar_one()


async def get_pipeline(db: AsyncSession, pipeline_id: str) -> Pipeline:
    pipeline = await db.get(Pipeline, pipeline_id)
    if pipeline is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Pipeline '{pipeline_id}' not found.")
    return pipeline


async def create_pipeline(db: AsyncSession, data: PipelineCreate) -> Pipeline:
    flow = await db.get(Flow, data.flow_id)
    if flow is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Flow '{data.flow_id}' not found.")

    pipeline = Pipeline(
        id=str(uuid.uuid4()),
        flow_id=data.flow_id,
        name=data.name,
        description=data.description,
        env_vars=data.env_vars,
        secrets=data.secrets,
    )
    db.add(pipeline)
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


async def update_pipeline_status(db: AsyncSession, pipeline_id: str, data: PipelineStatusUpdate) -> Pipeline:
    pipeline = await get_pipeline(db, pipeline_id)
    pipeline.status = data.status
    await db.commit()
    await db.refresh(pipeline)
    return pipeline


async def delete_pipeline(db: AsyncSession, pipeline_id: str) -> None:
    pipeline = await get_pipeline(db, pipeline_id)
    await db.delete(pipeline)
    await db.commit()
