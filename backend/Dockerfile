# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (for npm install)
COPY package*.json ./

# Install dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the application
COPY src ./src
COPY content.json .
COPY uploads ./uploads

# Expose port 3000 (can be overridden if needed)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
