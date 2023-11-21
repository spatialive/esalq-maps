# Stage 1: Compile and build the application
FROM node:latest as build

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/rpd-webmap /usr/share/nginx/html
COPY --from=build /app/dist/rpd-webmap /usr/share/nginx/html/rpd

COPY ./devops/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
