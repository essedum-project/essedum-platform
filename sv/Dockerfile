# Stage 1: Build with Maven
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /sv

COPY . .

RUN mvn clean install -Dmaven.test.skip=true -Dlicense.skip=true

RUN mkdir /app
RUN mkdir /app/conf
RUN mkdir /app/lib
RUN mkdir /app/log
RUN mkdir /app/modules
RUN mkdir /app/plugins
RUN cp /sv/common-app/src/main/resources/*.yml /app/conf
RUN cp /sv/common-app/src/main/resources/*.xml /app/conf
RUN chmod 777 /sv/copy_jars.sh
RUN /sv/copy_jars.sh

# Use an official OpenJDK 21 base image
FROM openjdk:21-jdk-slim

USER root
# Install Nginx
RUN apt-get update && apt-get install -y nginx && apt-get clean

COPY nginx_backend.conf /etc/nginx/nginx.conf

# Set the Java path
ENV JAVA_HOME=/usr/local/openjdk-21
ENV PATH="$JAVA_HOME/bin:$PATH"

COPY --from=builder /app /app/
WORKDIR /app
ENV LEAP_HOME=/app

# COPY appstart.sh /app/
# RUN chmod +x /app/appstart.sh

CMD ["/bin/bash", "-c", "service nginx start && java -Dspring.config.location=/app/conf/ -Dencryption.key=leap$123## -Dencryption.salt=NB9+lv0guQXYrZYbTmcS20Vd5FxW1h75b8CaI8r+nnPvYrIIHfYu05JVQf9qtJNCS0Vznh692VhUW9HeCPd2IA== -DLOG_PATH=/app/log -Dlicense=sOJDitKH4axL5syVqJDVXv4pmu3HZc4uzAwulC6cwf8mpNm9nWVvQA== -Dpublickey=3bQAP+ugsTVGLWdZ -Dlogging.level.com.springframework.security=DEBUG -Dlogging.level.com.infosys.icets.ai.comm.lib.util.logger=ERROR -Dspring.profiles.active=mysql,dbjwt,btf,dbconstants,vault -cp common-app-3.3-SNAPSHOT.jar:lib/*:modules/*:plugins/*:conf/* com.infosys.Common -Dhttp.nonProxyHosts=aiplatform.az.ad.idemo-ppc.com"]

EXPOSE 8082
