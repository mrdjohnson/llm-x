# Use the official Node.js image as the base image
FROM node:21-bullseye

# Set the working directory inside the container
WORKDIR /app

# Copy the entire project
COPY . .

# Set the yarn version to be that defined as packageManager
RUN yarn set version 4.1.1

# Install the dependencies
RUN yarn install --immutable

# Build the Vite app with the base path
RUN yarn run build 

# Expose the port on which the app will run 
EXPOSE 5173

# Start the app with dist directory
CMD ["yarn", "preview", "--host", "--port", "5173"]
