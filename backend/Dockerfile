# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY src ./src
COPY content.json .
COPY uploads ./uploads

# Expose port (default 3000, can be overridden)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
