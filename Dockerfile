# Stage 1: Build the React application
FROM node:21-bullseye AS build

# Set the working directory
WORKDIR /app

# Copy the entire project
COPY . .

# Set Yarn version and install dependencies
RUN yarn set version 4.1.1
RUN yarn install --immutable

# Build the Vite app
RUN yarn run build

# Stage 2: Serve the React app with Nginx
FROM nginx:latest

# Copy the build output to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy SSL certificates
COPY certs/cert.pem /etc/nginx/certs/cert.pem
COPY certs/key.pem /etc/nginx/certs/key.pem

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
# COPY nginx.conf /etc/nginx/conf.d

COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 5173
# EXPOSE 5173
EXPOSE 80 443

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
