# MG-RASTv4 web

FROM nginx:stable-alpine
COPY . /usr/share/nginx/html/
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
COPY nginx-selfsigned.crt /etc/ssl/certs
COPY nginx-selfsigned.key /etc/ssl/private
EXPOSE 80
EXPOSE 443
