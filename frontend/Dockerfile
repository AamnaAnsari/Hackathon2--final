FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm install --production=false

# Copy the rest of the frontend source code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose frontend port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
