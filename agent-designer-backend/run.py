import os
import sys
import asyncio
from pathlib import Path

# Ensure we're in the backend directory
backend_dir = Path(__file__).resolve().parent
os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    import uvicorn
    root_path = os.environ.get("ROOT_PATH", "")

    # Use loop_factory to force SelectorEventLoop — required on Windows where
    # aiosqlite deadlocks under the default ProactorEventLoop. SelectorEventLoop
    # is the default on Linux/macOS so this is a no-op there.
    async def _serve() -> None:
        config = uvicorn.Config(
            "app.main:app",
            host="0.0.0.0",
            port=8180,
            root_path=root_path,
        )
        server = uvicorn.Server(config)
        await server.serve()

    asyncio.run(_serve(), loop_factory=asyncio.SelectorEventLoop)
