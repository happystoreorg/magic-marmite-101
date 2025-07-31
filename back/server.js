const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dossier pour stocker les fichiers JSON
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Route pour enregistrer une demande de location
app.post('/api/demandes', (req, res) => {
  try {
    const demande = req.body;
    
    // Ajouter un timestamp et un ID unique
    const timestamp = new Date().toISOString();
    const id = Date.now().toString();
    
    const demandeComplete = {
      id,
      timestamp,
      ...demande
    };

    // Nom du fichier basé sur la date et l'ID
    const fileName = `demande_${new Date().toISOString().split('T')[0]}_${id}.json`;
    const filePath = path.join(dataDir, fileName);

    // Écrire le fichier JSON
    fs.writeFileSync(filePath, JSON.stringify(demandeComplete, null, 2));

    // Également maintenir un fichier de toutes les demandes
    const allDemandesPath = path.join(dataDir, 'toutes_demandes.json');
    let toutesLesdemandes = [];
    
    if (fs.existsSync(allDemandesPath)) {
      const data = fs.readFileSync(allDemandesPath, 'utf8');
      toutesLesdemandes = JSON.parse(data);
    }
    
    toutesLesdemandes.push(demandeComplete);
    fs.writeFileSync(allDemandesPath, JSON.stringify(toutesLesdemandes, null, 2));

    console.log(`Demande sauvegardée: ${fileName}`);
    
    res.status(201).json({
      success: true,
      message: 'Demande enregistrée avec succès',
      id: id,
      fileName: fileName
    });

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la demande',
      error: error.message
    });
  }
});

// Route pour récupérer toutes les demandes
app.get('/api/demandes', (req, res) => {
  try {
    const allDemandesPath = path.join(dataDir, 'toutes_demandes.json');
    
    if (fs.existsSync(allDemandesPath)) {
      const data = fs.readFileSync(allDemandesPath, 'utf8');
      const demandes = JSON.parse(data);
      res.json(demandes);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes',
      error: error.message
    });
  }
});

// Route pour récupérer une demande spécifique
app.get('/api/demandes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const allDemandesPath = path.join(dataDir, 'toutes_demandes.json');
    
    if (fs.existsSync(allDemandesPath)) {
      const data = fs.readFileSync(allDemandesPath, 'utf8');
      const demandes = JSON.parse(data);
      const demande = demandes.find(d => d.id === id);
      
      if (demande) {
        res.json(demande);
      } else {
        res.status(404).json({
          success: false,
          message: 'Demande non trouvée'
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: 'Aucune demande trouvée'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la demande',
      error: error.message
    });
  }
});

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend fonctionnel!' });
});

// Servir la page de test
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Dossier de données: ${dataDir}`);
});
