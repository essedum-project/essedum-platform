# Pre-built image (JAR built on host via build-and-push.sh)
# Build context: sv/usm-service/
FROM eclipse-temurin:21-jdk

LABEL maintainer="ESSEDUM Platform Team"
LABEL service="usm-service"

RUN mkdir -p /app/conf /app/lib /app/log

WORKDIR /app

COPY target/usm-service*.jar ./
COPY target/dependency/ ./lib/
COPY src/main/resources/*.yml ./conf/

ENV ESSEDUM_HOME=/app
ENV JAVA_OPTS="-Xms128m -Xmx256m"

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/actuator/health || exit 1

CMD ["/bin/bash", "-c", "java ${JAVA_OPTS:--Xms128m -Xmx256m} -Dspring.profiles.active=mysql,oauth2,dbconstants -Dspring.config.location=/app/conf/ -DLOG_PATH=/app/log -jar $(ls /app/usm-service*.jar | head -1)"]
