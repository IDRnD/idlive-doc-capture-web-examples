# build stage
FROM node:18.17.1-alpine3.18 AS build-stage
WORKDIR /app/build

COPY package*.json install-dependencies.sh ./
COPY libs ./libs
RUN npm run install-dependencies

COPY *.js *.json *.html ./
COPY public ./public
COPY src ./src

RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage

COPY --from=build-stage /app/build/dist /usr/share/nginx/html
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
