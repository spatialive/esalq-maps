# Stage 1: Compile and build the application
FROM node:16 as build
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build -- --outputPath=./dist/rpd-webmap --configuration production

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/rpd-webmap /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
