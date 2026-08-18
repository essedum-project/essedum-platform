# ============================================================
# CHANGE: Layered multi-stage Docker build
#
# WHY: Previously copied the entire fat JAR (~80-150MB) as a single
# Docker layer. Every code change — even 1 line — invalidated the
# whole layer and forced a full re-upload on every CI/CD push.
#
# HOW LAYERED BUILD WORKS:
# Stage 1 (builder): Uses 'jarmode=layertools' to extract the fat JAR
#   into 4 separate folders:
#     dependencies/          ← 3rd party libs  (changes ~monthly)
#     spring-boot-loader/    ← Spring internals (almost never changes)
#     snapshot-dependencies/ ← Internal libs    (rarely changes)
#     application/           ← YOUR code only   (~500KB, changes every commit)
#
# Stage 2 (runtime): Copies each folder as a SEPARATE Docker layer.
#   Docker caches layers 1-3. Only layer 4 is re-uploaded on code change.
#   Result: 150MB push → ~500KB push on every code commit.
#
# ALSO: Switched from eclipse-temurin:21-jdk → eclipse-temurin:21-jre
#   JDK includes compiler tools not needed at runtime → image ~200MB smaller
# ============================================================

# ── Stage 1: Extract JAR layers ───────────────────────────────────────────────
FROM eclipse-temurin:21-jre AS builder
WORKDIR /builder
COPY target/api-gateway*.jar app.jar
# Extracts into: /builder/dependencies/, /builder/spring-boot-loader/,
#                /builder/snapshot-dependencies/, /builder/application/
RUN java -Djarmode=layertools -jar app.jar extract

# ── Stage 2: Minimal runtime image ────────────────────────────────────────────
FROM eclipse-temurin:21-jre

LABEL maintainer="ESSEDUM Platform Team"
LABEL service="api-gateway"

RUN mkdir -p /app/conf /app/log

WORKDIR /app

# Copy layers from least → most frequently changed.
# Docker caches each COPY instruction as a separate image layer.
# On a code-only change, only the last COPY (application/) is invalidated.
COPY --from=builder /builder/dependencies/ ./
COPY --from=builder /builder/spring-boot-loader/ ./
COPY --from=builder /builder/snapshot-dependencies/ ./
COPY --from=builder /builder/application/ ./

# External YAML config — copied last so config changes don't invalidate
# the application layer cache. Placed in /app/conf/ for runtime override
# via -Dspring.config.location (same behaviour as before).
COPY src/main/resources/*.yml ./conf/

ENV ESSEDUM_HOME=/app
ENV JAVA_OPTS="-Xms128m -Xmx256m"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Spring Boot 3.x layered JAR launcher (replaces java -jar)
CMD ["/bin/bash", "-c", "java ${JAVA_OPTS:--Xms128m -Xmx256m} -Dspring.profiles.active=mysql,oauth2,dbconstants -Dspring.config.location=/app/conf/ -DLOG_PATH=/app/log org.springframework.boot.loader.launch.JarLauncher"]