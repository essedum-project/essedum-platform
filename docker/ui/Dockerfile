FROM infyartifactory.jfrog.io/docker-local/leap/base/nginx:bp-nginx-image-1.25.1-R1
USER root
RUN ln -s /layers/paketo-buildpacks_nginx/nginx/sbin/nginx /usr/sbin/nginx
RUN echo 'Leap@123\nLeap@123' | passwd
# remove the github.com/golang/go
RUN rm /cnb/lifecycle/launcher && rm /layers/paketo-buildpacks_nginx/nginx/exec.d/0-configure
USER cnb
RUN mkdir /workspace/log && \
    mkdir /workspace/pid && \
    mkdir /workspace/data && \
    mkdir /workspace/tmp && \
    mkdir /workspace/html && \
    mkdir /workspace/app

COPY nginx/conf/nginx.conf /workspace/
COPY ./nginx/html/ /workspace/html/
COPY ./leapui/ /workspace/app/
WORKDIR /workspace/app
ENV LEAP_HOME=/workspace/app
ENV LOGS=/workspace/logs/
ENTRYPOINT [ "/bin/bash", "-l", "-c" ]
EXPOSE 8080 8082 8084 8443
