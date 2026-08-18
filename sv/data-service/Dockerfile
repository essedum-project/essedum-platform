# ── Stage 1: Extract JAR layers ───────────────────────────────────────────────
FROM eclipse-temurin:21-jre AS builder
WORKDIR /builder
COPY target/data-service*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# ── Stage 2: Minimal runtime image ────────────────────────────────────────────
FROM eclipse-temurin:21-jre

LABEL maintainer="ESSEDUM Platform Team"
LABEL service="data-service"

RUN mkdir -p /app/conf /app/log

WORKDIR /app

COPY --from=builder /builder/dependencies/ ./
COPY --from=builder /builder/spring-boot-loader/ ./
COPY --from=builder /builder/snapshot-dependencies/ ./
COPY --from=builder /builder/application/ ./

COPY src/main/resources/*.yml ./conf/

ENV ESSEDUM_HOME=/app
ENV JAVA_OPTS="-Xms128m -Xmx256m"

EXPOSE 8083

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8083/actuator/health || exit 1

CMD ["/bin/bash", "-c", "java ${JAVA_OPTS:--Xms128m -Xmx256m} -Dspring.profiles.active=mysql,oauth2,dbconstants -Dspring.config.location=/app/conf/ -DLOG_PATH=/app/log org.springframework.boot.loader.launch.JarLauncher"]