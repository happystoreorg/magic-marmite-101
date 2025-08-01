# Utilise une image Node officielle comme image de base
FROM node:18-alpine

# Définit le répertoire de travail dans le conteneur
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install --production

# Copie le reste de l'application
COPY . .

# Expose le port (modifie selon ton app, ex: 3000)
EXPOSE 3000

# Commande de démarrage (modifie selon ton app, ex: npm start ou node index.js)
CMD ["npm", "start"]
