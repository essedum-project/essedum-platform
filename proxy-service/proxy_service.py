
import os
import asyncio
import logging
import posixpath
from aiohttp import web, ClientSession, ClientTimeout, TCPConnector, WSMsgType
from yarl import URL  # comes with aiohttp; used to attach query string safely

# --- Config ---
NS = os.getenv("TARGET_NAMESPACE", "aipns")
ALLOWLIST = os.getenv("ALLOWLIST")  # e.g., "runner-service,builder-service"
ALLOW = set(ALLOWLIST.split(",")) if ALLOWLIST else None

def is_valid_service_name(name: str) -> bool:
    """
    Validate that `name` is a safe service identifier.

    We restrict to a DNS-label-like pattern commonly used for Kubernetes
    service names: 1–63 chars, lowercase letters, digits, and hyphens,
    starting and ending with an alphanumeric character.
    This prevents injection of schemes, slashes, or dots that could
    influence the upstream URL beyond the intended namespace.
    """
    if not name:
        return False
    if len(name) > 63:
        return False
    allowed = set("abcdefghijklmnopqrstuvwxyz0123456789-")
    if any(ch not in allowed for ch in name):
        return False
    if not (name[0].isalnum() and name[-1].isalnum()):
        return False
    return True

# hop-by-hop headers must not be forwarded by proxies
HOP_BY_HOP = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade",
}

def sanitize_headers(headers: web.BaseRequest.headers):
    clean = {}
    for k, v in headers.items():
        lk = k.lower()
        if lk in HOP_BY_HOP or lk == "host":
            continue
        clean[k] = v
    return clean

async def health(_request):
    return web.json_response({"status": "ok"})

def sanitize_subpath(subpath: str) -> str:
    """
    Normalize subpath to prevent path traversal attacks.
    Strips leading slashes and removes '..' / '.' segments so that
    user-supplied paths cannot escape the intended upstream scope.
    """
    if not subpath:
        return ""
    # posixpath.normpath resolves '..', '.', and duplicate slashes.
    # Prepend '/' so normpath treats the input as absolute, then remove it.
    normalized = posixpath.normpath("/" + subpath)
    return normalized.lstrip("/")

def build_upstream(service: str, subpath: str) -> str:
    """Build upstream URL base for service + subpath."""
    sub = f"/{subpath}" if subpath else "/"
    return f"http://{service}.{NS}.svc.cluster.local{sub}"

# -------------------------
# HTTP proxy (polling etc.)
# -------------------------
async def http_proxy(request: web.Request):
    service = request.match_info.get("service")
    subpath = request.match_info.get("subpath", "")

    if not is_valid_service_name(service):
        return web.Response(text=f"Invalid service name '{service}'", status=400)
    
    if ALLOW is not None and service not in ALLOW:
        return web.Response(text=f"Service '{service}' not allowed", status=403)

    subpath = sanitize_subpath(subpath)

    # NOTE: For Socket.IO polling, subpath will be "socket.io"
    target = build_upstream(service, subpath)
    headers = sanitize_headers(request.headers)
    data = await request.read()

    timeout = ClientTimeout(total=120)
    connector = TCPConnector(ssl=False)

    # Preserve query string (EIO=4, transport=polling, t=..., etc.)
    upstream_url = str(URL(target).with_query(request.rel_url.query))

    async with ClientSession(timeout=timeout, connector=connector) as session:
        try:
            async with session.request(
                method=request.method,
                url=upstream_url,
                headers=headers,
                data=data,
            ) as resp:
                out_headers = {k: v for (k, v) in resp.headers.items()}
                body = await resp.read()
                return web.Response(body=body, status=resp.status, headers=out_headers)
        except Exception as e:
            return web.Response(text=f"Upstream error: {e}", status=502)

# ---------------------------------
# WebSocket proxy (Socket.IO WS)
# ---------------------------------
async def websocket_proxy(request: web.Request) -> web.StreamResponse:
    """
    Reverse-proxy WebSocket for Socket.IO upgrade.
    Rewrites /apps/<service>/socket.io -> upstream /socket.io and PRESERVES QUERY.
    """

    # Extract service & subpath whether called via route or middleware
    service = request.match_info.get("service")
    subpath = request.match_info.get("subpath", "")
    if not service and request.path.startswith("/apps/"):
        # parse from raw path: /apps/<service>/<subpath?>
        parts = request.path[len("/apps/"):].split("/", 1)
        service = parts[0]
        subpath = parts[1] if len(parts) > 1 else ""

    if not is_valid_service_name(service):
        return web.Response(text=f"Invalid service name '{service}'", status=400)
    
    if ALLOW is not None and service not in ALLOW:
        return web.Response(text=f"Service '{service}' not allowed", status=403)

    subpath = sanitize_subpath(subpath)

    # For Socket.IO WS, upstream must be /socket.io
    # (Keep any additional subpath segments after 'socket.io/' if present.)
    upstream_path = "socket.io"
    if subpath and subpath.startswith("socket.io"):
        upstream_path = subpath

    base = build_upstream(service, upstream_path)
    # Preserve the original query string (EIO=4&transport=websocket&sid=...)
    upstream_url = URL(base).with_query(request.rel_url.query)

    headers = sanitize_headers(request.headers)

    # 1) Accept client WebSocket
    ws_client = web.WebSocketResponse(heartbeat=25)  # heartbeat aligns with server ping
    await ws_client.prepare(request)

    timeout = ClientTimeout(total=None, sock_connect=30, sock_read=None)
    connector = TCPConnector(ssl=False)

    async with ClientSession(timeout=timeout, connector=connector) as session:
        try:
            # 2) Connect to upstream WebSocket
            ws_upstream = await session.ws_connect(str(upstream_url), headers={
                # Forward Origin if present (useful for CORS decisions upstream)
                "Origin": request.headers.get("Origin", ""),
            })

            async def client_to_upstream():
                async for msg in ws_client:
                    if msg.type == WSMsgType.TEXT:
                        await ws_upstream.send_str(msg.data)
                    elif msg.type == WSMsgType.BINARY:
                        await ws_upstream.send_bytes(msg.data)
                    elif msg.type in (WSMsgType.CLOSE, WSMsgType.CLOSED):
                        await ws_upstream.close()
                        break
                    elif msg.type == WSMsgType.ERROR:
                        break

            async def upstream_to_client():
                async for msg in ws_upstream:
                    if msg.type == WSMsgType.TEXT:
                        await ws_client.send_str(msg.data)
                    elif msg.type == WSMsgType.BINARY:
                        await ws_client.send_bytes(msg.data)
                    elif msg.type in (WSMsgType.CLOSE, WSMsgType.CLOSED):
                        await ws_client.close()
                        break
                    elif msg.type == WSMsgType.ERROR:
                        break

            # 3) Bridge frames BOTH WAYS (this was previously incorrect)
            await asyncio.gather(client_to_upstream(), upstream_to_client())

        except Exception as e:
            # If upstream WS fails, close client WS and surface error
            await ws_client.close()
            return web.Response(text=f"Upstream WS error: {e}", status=502)

    return ws_client

# -------------------------
# App factory + middleware
# -------------------------
def make_app():
    app = web.Application()

    # Health
    app.router.add_get("/health", health)

    # HTTP routes (polling etc.)
    app.router.add_route("*", "/apps/{service}/", http_proxy)
    app.router.add_route("*", "/apps/{service}/{subpath:.*}", http_proxy)

    # Optional explicit WS routes (if you prefer)
    # app.router.add_get("/apps/{service}/socket.io", websocket_proxy)
    # app.router.add_get("/apps/{service}/socket.io/{subpath:.*}", websocket_proxy)

    # Middleware to auto-detect Upgrade: websocket on /apps/*
    @web.middleware
    async def ws_upgrade_middleware(request, handler):
        if request.path.startswith("/apps/") and request.headers.get("Upgrade", "").lower() == "websocket":
            # Route to WS proxy
            return await websocket_proxy(request)
        return await handler(request)

    app.middlewares.append(ws_upgrade_middleware)
    return app

if __name__ == "__main__":
    # Enable access logging so you can SEE traffic & statuses in pod logs
    access_logger = logging.getLogger("aiohttp.access")
    logging.basicConfig(level=logging.INFO)

    app = make_app()
    web.run_app(app, host="0.0.0.0", port=int(os.getenv("PORT", "8080")), access_log=access_logger)

