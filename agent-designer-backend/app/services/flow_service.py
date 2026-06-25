import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.flow import Flow
from app.schemas.flow import FlowCreate, FlowUpdate
from app.core.exceptions import NotFoundError, ConflictError


async def list_flows(db: AsyncSession, skip: int = 0, limit: int = 50) -> list[Flow]:
    result = await db.execute(select(Flow).offset(skip).limit(limit))
    return list(result.scalars().all())


async def get_flow(db: AsyncSession, flow_id: str) -> Flow:
    flow = await db.get(Flow, flow_id)
    if flow is None:
        raise NotFoundError(f"Flow '{flow_id}' not found.")
    return flow


async def create_flow(db: AsyncSession, data: FlowCreate) -> Flow:
    flow = Flow(
        id=str(uuid.uuid4()),
        name=data.name,
        description=data.description,
        nodes=data.nodes,
        edges=data.edges,
        tags=data.tags,
        env_vars=data.env_vars,
        secrets=data.secrets,
    )
    db.add(flow)
    await db.commit()
    await db.refresh(flow)
    return flow


async def update_flow(db: AsyncSession, flow_id: str, data: FlowUpdate) -> Flow:
    flow = await get_flow(db, flow_id)
    patch = data.model_dump(exclude_unset=True)
    for key, value in patch.items():
        setattr(flow, key, value)
    await db.commit()
    await db.refresh(flow)
    return flow


async def delete_flow(db: AsyncSession, flow_id: str) -> None:
    flow = await get_flow(db, flow_id)
    await db.delete(flow)
    await db.commit()
