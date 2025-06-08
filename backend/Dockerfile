# Usa la imagen oficial de Node 18 sobre Alpine (ligera)
FROM node:18-alpine                          

WORKDIR /usr/src/app

# Copia y instala dependencias
COPY package*.json ./
RUN npm ci                                  

# Copia el código fuente
COPY . .

EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
