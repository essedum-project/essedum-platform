FROM infyartifactory.jfrog.io/docker-local/leap/base/java:leap-base-bp-sv10
COPY nginx.conf /etc/nginx/
ADD ./app /app/
HEALTHCHECK --interval=5s --timeout=3s CMD wget --spider http://localhost:8080/actuator || exit 1
WORKDIR /app
ENV LEAP_HOME=/app
USER root
COPY appstart.sh /app/
RUN chmod 777 appstart.sh
ENTRYPOINT [ "/bin/bash", "-l", "-c" ]
EXPOSE 8080
