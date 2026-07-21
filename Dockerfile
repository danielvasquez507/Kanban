FROM node:20-slim

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiar el código
COPY . .

# Variables de entorno y puerto
ENV PORT=3000
EXPOSE 3000

# Ejecutar la aplicación
CMD ["node", "server.js"]
