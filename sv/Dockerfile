# Use an official OpenJDK 21 base image
FROM openjdk:21-jdk-slim

USER root
# Install Nginx
RUN apt-get update && apt-get install -y nginx && apt-get clean

COPY nginx.conf /etc/nginx/nginx.conf

# Set the Java path
ENV JAVA_HOME=/usr/local/openjdk-21
ENV PATH="$JAVA_HOME/bin:$PATH"

ADD ./app /app/
WORKDIR /app
ENV LEAP_HOME=/app

# COPY appstart.sh /app/
# RUN chmod +x /app/appstart.sh

CMD ["/bin/bash", "-c", "service nginx start && java -Dspring.config.location=/app/conf/ -Dencryption.key=leap$123## -Dencryption.salt=NB9+lv0guQXYrZYbTmcS20Vd5FxW1h75b8CaI8r+nnPvYrIIHfYu05JVQf9qtJNCS0Vznh692VhUW9HeCPd2IA== -DLOG_PATH=/app/log -Dlicense=sOJDitKH4axL5syVqJDVXv4pmu3HZc4uzAwulC6cwf8mpNm9nWVvQA== -Dpublickey=3bQAP+ugsTVGLWdZ -Dlogging.level.com.springframework.security=DEBUG -Dlogging.level.com.infosys.icets.ai.comm.lib.util.logger=ERROR -cp common-app-3.3-SNAPSHOT.jar:lib/*:modules/*:plugins/*:conf/* com.infosys.Common"]

EXPOSE 8082
