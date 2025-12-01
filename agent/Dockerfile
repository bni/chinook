# Use Alpine Linux as base image
FROM node:24-alpine

# Install Python, curl, and common bash tools
RUN apk add --no-cache python3 py3-pip curl bash coreutils grep sed gawk findutils

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy application files
COPY . ./

# Run the agent
CMD ["npm", "start"]
