# Use the official Nginx image
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /app/ui

WORKDIR /app

COPY aip.zip /app/
COPY shell.zip /app/

RUN unzip /app/aip.zip -d /app/aip
RUN unzip /app/shell.zip -d /app/shell

RUN mkdir -p /app/ui/aip
RUN mkdir -p /app/ui/common

RUN cp -r /app/aip/dist/aip-app/* /app/ui/aip
RUN cp -r /app/shell/dist/common-app/* /app/ui/common

RUN rm -rf /app/aip
RUN rm -rf /app/shell
RUN rm -f /app/*.zip

WORKDIR /

EXPOSE 8082 8084

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
