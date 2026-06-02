# -------------------------------------------------------
# Stage 1: Build with Maven
# -------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-21 AS maven_builder

WORKDIR /sv

COPY . .

RUN mvn clean install -pl api-gateway -am -Dmaven.test.skip=true -Dlicense.skip=true

RUN mkdir -p /app/conf /app/lib /app/log

RUN cp /sv/api-gateway/src/main/resources/*.yml /app/conf

# Copy the compiled api-gateway JAR
RUN cp /sv/api-gateway/target/api-gateway*.jar /app/

# Use Maven dependency plugin to copy only runtime dependencies
RUN cd /sv/api-gateway && mvn dependency:copy-dependencies -DoutputDirectory=/app/lib -Dmdep.prependGroupId=false -DskipTests -DincludeScope=runtime


# -------------------------------------------------------
# Stage 2: Runtime image
# -------------------------------------------------------
FROM eclipse-temurin:21-jdk

LABEL maintainer="ESSEDUM Platform Team"
LABEL service="api-gateway"

ENV JAVA_HOME=/usr/local/openjdk-21
ENV PATH="$JAVA_HOME/bin:$PATH"

# Copy from first stage
COPY --from=maven_builder /app /app/

WORKDIR /app

ENV ESSEDUM_HOME=/app
ENV JAVA_OPTS="-Xms128m -Xmx256m"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

CMD ["/bin/bash", "-c", "java ${JAVA_OPTS} -Dspring.config.location=/app/conf/ -DLOG_PATH=/app/log -cp api-gateway-3.3-SNAPSHOT.jar:lib/*:conf/* com.lfn.gateway.ApiGatewayApplication"]
