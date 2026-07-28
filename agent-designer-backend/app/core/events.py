import logging
from app.db.session import engine
from app.db.base import Base
from app.config import settings

logger = logging.getLogger("agentflow")


async def on_startup() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    logger.info("AgentFlow API starting up…")
    # Tables are managed by Alembic in production.
    # For local dev convenience, create tables automatically.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified.")

    if settings.salus_enabled:
        logger.info(
            "Salus guard ENABLED — moderation: %s  privacy: %s",
            settings.salus_moderation_url,
            settings.salus_privacy_url,
        )
    else:
        logger.info("Salus guard disabled (set SALUS_ENABLED=true to enable).")


async def on_shutdown() -> None:
    logger.info("AgentFlow API shutting down…")
    await engine.dispose()
    # Close the shared Salus HTTP client if it was initialised.
    from app.core.salus_client import get_salus_client
    await get_salus_client().close()
