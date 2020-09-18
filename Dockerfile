# MG-RASTv4 web

FROM nginx:stable-alpine
COPY . /usr/share/nginx/html/

EXPOSE 80

# write /VERSION.txt
RUN apk add git && cd /usr/share/nginx/html && echo $(git describe --tags) > /usr/share/nginx/html/VERSION.txt && apk del git
