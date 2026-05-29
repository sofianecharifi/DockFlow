FROM node:20

WORKDIR /app

# Copy package.json files
COPY backend/package*.json ./backend/

# Force la compilation de sqlite3 depuis les sources du conteneur
WORKDIR /app/backend
RUN npm install --build-from-source=sqlite3

# Go back to /app and copy ONLY the necessary files (no node_modules)
WORKDIR /app
COPY backend/src ./backend/src
COPY backend/app.js ./backend/app.js
COPY backend/.env ./backend/.env
COPY frontend ./frontend

# Expose port
EXPOSE 3000

# Start
WORKDIR /app/backend
CMD ["npm", "start"]