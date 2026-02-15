FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build args
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID

# Environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build the application
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Expose Frontend port
EXPOSE 3000

# Serve the 'dist' directory on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
