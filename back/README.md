# Magic Marmite Backend

Backend API pour l'application de location de matériel événementiel.

## Installation

```bash
npm install
```

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur le port 3000 par défaut.

## API Endpoints

### POST /api/demandes
Enregistre une nouvelle demande de location.

### GET /api/demandes
Récupère toutes les demandes.

### GET /api/demandes/:id
Récupère une demande spécifique par son ID.

### GET /api/test
Route de test pour vérifier que le serveur fonctionne.

## Structure des données

Les demandes sont sauvegardées dans le dossier `data/` :
- Un fichier JSON par demande : `demande_YYYY-MM-DD_ID.json`
- Un fichier consolidé : `toutes_demandes.json`
