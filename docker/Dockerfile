# 1. Stage de build
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar definición de dependencias y tsconfig
COPY package.json package-lock.json tsconfig.json ./

# Instalar dependencias (producción + dev)
RUN npm ci

# Copiar el código fuente
COPY src/ ./src

# Compilar TypeScript a JavaScript
RUN npm run build

# 2. Stage de producción
FROM node:18-alpine AS runner
WORKDIR /app

# Copiar únicamente lo necesario de builder
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./

# Instalar solo producción
RUN npm ci --only=production

# Crear carpeta data para montar los .dat
RUN mkdir -p data

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["node", "dist/index.js"]