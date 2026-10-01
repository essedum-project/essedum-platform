FROM debian:bookworm-slim

# Install OpenCode + nginx (TLS termination) + Python3 (request rewriting proxy)
RUN apt-get update && apt-get install -y curl ca-certificates nginx openssl python3 && \
    curl -fsSL https://opencode.ai/install | bash && \
    ln -s /root/.opencode/bin/opencode /usr/local/bin/opencode && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Generate a local CA + certs for api.openai.com AND nano-gpt.com
RUN mkdir -p /etc/nginx/ssl && \
    openssl genrsa -out /etc/nginx/ssl/ca.key 2048 && \
    openssl req -x509 -new -nodes -key /etc/nginx/ssl/ca.key \
      -sha256 -days 3650 -out /etc/nginx/ssl/ca.crt \
      -subj "/CN=LocalProxy CA/O=LocalProxy" && \
    openssl genrsa -out /etc/nginx/ssl/openai.key 2048 && \
    openssl req -new -key /etc/nginx/ssl/openai.key \
      -out /etc/nginx/ssl/openai.csr \
      -subj "/CN=api.openai.com/O=LocalProxy" && \
    printf "subjectAltName=DNS:api.openai.com\n" > /etc/nginx/ssl/ext.cnf && \
    openssl x509 -req -in /etc/nginx/ssl/openai.csr \
      -CA /etc/nginx/ssl/ca.crt -CAkey /etc/nginx/ssl/ca.key -CAcreateserial \
      -out /etc/nginx/ssl/openai.crt -days 3650 \
      -extfile /etc/nginx/ssl/ext.cnf -sha256 && \
    openssl genrsa -out /etc/nginx/ssl/nanogpt.key 2048 && \
    openssl req -new -key /etc/nginx/ssl/nanogpt.key \
      -out /etc/nginx/ssl/nanogpt.csr \
      -subj "/CN=nano-gpt.com/O=LocalProxy" && \
    printf "subjectAltName=DNS:nano-gpt.com,DNS:*.nano-gpt.com\n" > /etc/nginx/ssl/nanogpt_ext.cnf && \
    openssl x509 -req -in /etc/nginx/ssl/nanogpt.csr \
      -CA /etc/nginx/ssl/ca.crt -CAkey /etc/nginx/ssl/ca.key -CAcreateserial \
      -out /etc/nginx/ssl/nanogpt.crt -days 3650 \
      -extfile /etc/nginx/ssl/nanogpt_ext.cnf -sha256 && \
    cp /etc/nginx/ssl/ca.crt /usr/local/share/ca-certificates/localproxy-ca.crt && \
    update-ca-certificates

# nginx: SSL-terminate api.openai.com AND nano-gpt.com → local Python proxy on port 8888
RUN rm -f /etc/nginx/sites-enabled/default && \
    cat > /etc/nginx/sites-enabled/openai-proxy << 'EOF'
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name api.openai.com;

    ssl_certificate     /etc/nginx/ssl/openai.crt;
    ssl_certificate_key /etc/nginx/ssl/openai.key;

    location / {
        proxy_pass         http://127.0.0.1:8888;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_buffering    off;
        proxy_cache        off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name nano-gpt.com *.nano-gpt.com;

    ssl_certificate     /etc/nginx/ssl/nanogpt.crt;
    ssl_certificate_key /etc/nginx/ssl/nanogpt.key;

    location / {
        proxy_pass         http://127.0.0.1:8888;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_buffering    off;
        proxy_cache        off;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
EOF

# Python proxy: rewrites model names, strips Ollama-unsupported params, forwards to LiteLLM
RUN cat > /proxy.py << 'PYEOF'
#!/usr/bin/env python3
"""HTTP proxy: rewrites OpenCode model names and strips Ollama-unsupported params."""
import http.server
import http.client
import json
import urllib.parse

LITELLM_HOST = ""        # TODO: fill in your LiteLLM host IP / hostname
LITELLM_PORT = 4000      # TODO: fill in your LiteLLM port
LITELLM_KEY  = ""        # TODO: fill in your LiteLLM master key

MODEL_MAP = {
    "gpt-6.1-sol":        "gemma4",
    "openai/gpt-6.1-sol": "gemma4",
    "gpt-4o":             "gemma4",
    "openai/gpt-4o":      "gemma4",
    "gpt-4o-mini":        "gemma4",
    "openai/gpt-4o-mini": "gemma4",
    "gpt-4.1":            "gemma4",
    "openai/gpt-4.1":     "gemma4",
    "gpt-4.1-mini":       "gemma4",
    "openai/gpt-4.1-mini":"gemma4",
}

# Params Ollama does not support; OpenCode/OpenAI may include these
_STRIP_PARAMS = {
    "prompt_cache_key", "store", "reasoning_effort",
    "stream_options", "logprobs", "top_logprobs", "parallel_tool_calls",
}

def _normalize_model(name):
    """Look up model by full name or short name (strips provider/ prefix), fall back to gemma4."""
    short = name.split("/")[-1] if "/" in name else name
    return MODEL_MAP.get(name) or MODEL_MAP.get(short) or "gemma4"

class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        te = self.headers.get("Transfer-Encoding", "")
        if length:
            return self.rfile.read(length)
        if "chunked" in te.lower():
            body = b""
            while True:
                size_line = self.rfile.readline().strip()
                if not size_line:
                    continue
                chunk_size = int(size_line, 16)
                if chunk_size == 0:
                    break
                body += self.rfile.read(chunk_size)
                self.rfile.readline()  # consume trailing CRLF
            return body
        return b""

    def _forward(self, body):
        parsed = urllib.parse.urlparse(self.path)
        path   = parsed.path or "/"
        if path.startswith("/api/"):
            path = path[4:]
        if parsed.query:
            path += "?" + parsed.query

        headers = {
            "Authorization": "Bearer " + LITELLM_KEY,
            "Content-Type":  "application/json",
        }
        if body is not None:
            headers["Content-Length"] = str(len(body))

        conn = http.client.HTTPConnection(LITELLM_HOST, LITELLM_PORT, timeout=300)
        conn.request(self.command, path, body=body, headers=headers)
        resp = conn.getresponse()

        self.send_response(resp.status)
        for key, val in resp.getheaders():
            if key.lower() not in ("transfer-encoding", "connection"):
                self.send_header(key, val)
        self.send_header("Transfer-Encoding", "chunked")
        self.end_headers()

        while True:
            chunk = resp.read(4096)
            if not chunk:
                break
            size_hex = ("%x\r\n" % len(chunk)).encode()
            self.wfile.write(size_hex)
            self.wfile.write(chunk)
            self.wfile.write(b"\r\n")
            self.wfile.flush()
        self.wfile.write(b"0\r\n\r\n")
        self.wfile.flush()
        conn.close()

    def do_POST(self):
        body = self._read_body()
        try:
            data = json.loads(body)
            if isinstance(data, dict):
                if "model" in data:
                    data["model"] = _normalize_model(data["model"])
                for p in _STRIP_PARAMS:
                    data.pop(p, None)
            body = json.dumps(data).encode()
        except Exception:
            pass
        self._forward(body)

    def do_GET(self):
        self._forward(None)

if __name__ == "__main__":
    server = http.server.HTTPServer(("127.0.0.1", 8888), Handler)
    print("Proxy listening on 127.0.0.1:8888", flush=True)
    server.serve_forever()
PYEOF
RUN chmod +x /proxy.py

# Bake in OpenCode config — use a real OpenAI model name so OpenCode routes via
# the openai provider (api.openai.com) rather than through nano-gpt.
# Our nginx intercepts api.openai.com and the Python proxy remaps gpt-4o-mini → gemma4.
# instructions: tell the model never to use the question/clarifying tool — it must
# generate code directly from the specification without asking follow-up questions.
RUN mkdir -p /root/.config/opencode && cat > /root/.config/opencode/opencode.jsonc << 'OPENCODE_CONFIG'
{
  "$schema": "https://opencode.ai/config.json",
  "model": "openai/gpt-4o-mini",
  "instructions": "You are a code generation assistant. Always generate complete, production-ready code directly from the given specifications. NEVER ask clarifying questions. NEVER use the question tool. If information is missing, make reasonable assumptions and proceed with code generation immediately."
}
OPENCODE_CONFIG

# Entrypoint
RUN cat > /entrypoint.sh << 'EOF'
#!/bin/bash
set -e
# Redirect both api.openai.com and nano-gpt.com to our local nginx TLS proxy
echo "127.0.0.1  api.openai.com" >> /etc/hosts
echo "::1  api.openai.com"       >> /etc/hosts
echo "127.0.0.1  nano-gpt.com"   >> /etc/hosts
echo "::1  nano-gpt.com"         >> /etc/hosts
# Trust our CA
export NODE_EXTRA_CA_CERTS=/etc/nginx/ssl/ca.crt
# OpenAI key — nginx overwrites it but opencode needs it non-empty
export OPENAI_API_KEY=sk-proxy
# Start Python proxy (plain HTTP → LiteLLM)
python3 /proxy.py &
sleep 0.5
# Start nginx (TLS → Python proxy)
nginx
echo "nginx started"
exec opencode serve --hostname 0.0.0.0 --port 3282
EOF
RUN chmod +x /entrypoint.sh

EXPOSE 3282
CMD ["/entrypoint.sh"]
