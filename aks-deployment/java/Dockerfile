# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /ai-platform

# Copy the entire ai-platform directory into the image
COPY ai-platform/ ./

# Build the sv module (adjust the path if needed)
WORKDIR /ai-platform/sv
RUN mvn clean install -Dmaven.test.skip=true -Dlicense.skip=true

RUN mkdir /app
RUN mkdir /app/conf
RUN mkdir /app/lib
RUN mkdir /app/log
RUN mkdir /app/modules
RUN mkdir /app/plugins
RUN cp -r /ai-platform/aks-deployment/java/conf /app/conf
RUN chmod 777 /ai-platform/aks-deployment/java/copy_jars.sh
RUN /ai-platform/aks-deployment/java/copy_jars.sh

# Use an official OpenJDK 21 base image
FROM openjdk:21-jdk-slim

USER root
# Install Nginx
RUN apt-get update && apt-get install -y nginx && apt-get clean

COPY /ai-platform/aks-deployment/java/nginx.conf /etc/nginx/nginx.conf

# Set the Java path
ENV JAVA_HOME=/usr/local/openjdk-21
ENV PATH="$JAVA_HOME/bin:$PATH"
COPY /ai-platform/aks-deployment/java/lfn-keycloak2.crt /usr/local/openjdk-21/bin

RUN keytool -importcert -trustcacerts -file $JAVA_HOME/bin/lfn-keycloak2.crt \
    -alias "lfn-keycloak2" \
    -keystore $JAVA_HOME/lib/security/cacerts \
    -storepass changeit -noprompt

COPY --from=builder /app /app/
WORKDIR /app
ENV LEAP_HOME=/app

# COPY appstart.sh /app/
# RUN chmod +x /app/appstart.sh

CMD ["/bin/bash", "-c", "service nginx start && java -Dspring.config.location=/app/conf/ -Dencryption.key=leap$123## -Dencryption.salt=NB9+lv0guQXYrZYbTmcS20Vd5FxW1h75b8CaI8r+nnPvYrIIHfYu05JVQf9qtJNCS0Vznh692VhUW9HeCPd2IA== -DLOG_PATH=/app/log -Dlicense=sOJDitKH4axL5syVqJDVXv4pmu3HZc4uzAwulC6cwf8mpNm9nWVvQA== -Dpublickey=3bQAP+ugsTVGLWdZ -Dlogging.level.com.springframework.security=DEBUG -Dlogging.level.com.infosys.icets.ai.comm.lib.util.logger=ERROR -cp common-app-3.3-SNAPSHOT.jar:lib/*:modules/*:plugins/*:conf/* com.infosys.Common -Dhttp.nonProxyHosts=aiplatform.az.ad.idemo-ppc.com"]

EXPOSE 8082
