FROM node:20-bookworm-slim
EXPOSE 5420

# Install dependencies
RUN apt update
RUN apt install -y --no-install-recommends build-essential
RUN apt install -y --no-install-recommends curl
RUN apt install -y --no-install-recommends ffmpeg
RUN apt install -y --no-install-recommends git
RUN apt install -y --no-install-recommends ssh
RUN apt install -y --no-install-recommends ca-certificates
RUN apt install -y --no-install-recommends python3
RUN apt install -y --no-install-recommends python3-pip

# Create workdir
RUN mkdir -p /app
WORKDIR /app

# Copy Files
COPY package.json ./
COPY . .

# Fix permissions
RUN chmod -R 777 /app
RUN chown -R node:node /app

# Set user to node
USER node

# Install modules
RUN npm install

# Start server
RUN export NODE_ENV=production
CMD ["npm", "run", "start"]