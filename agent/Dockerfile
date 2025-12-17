# Use Alpine Linux as base image
FROM node:24-alpine

# Install and copy files
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./

EXPOSE 4000

ENV PORT=4000

ENV HOSTNAME="0.0.0.0"
CMD ["npm", "run", "start"]
