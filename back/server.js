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
    console.info('POST on /api/demandes', req.body);
    const demande = req.body;
    const allDemandesPath = path.join(dataDir, 'toutes_demandes.json');
    let toutesLesdemandes = [];

    if (fs.existsSync(allDemandesPath)) {
      const data = fs.readFileSync(allDemandesPath, 'utf8');
      toutesLesdemandes = JSON.parse(data);
    }

    // Si la demande contient un id existant et non null/empty, faire un update (PUT)
    if (demande.id && typeof demande.id === 'string' && demande.id.trim() !== '' && toutesLesdemandes.some(d => d.id === demande.id)) {
      const idx = toutesLesdemandes.findIndex(d => d.id === demande.id);
      toutesLesdemandes[idx] = { ...toutesLesdemandes[idx], ...demande, id: demande.id };
      fs.writeFileSync(allDemandesPath, JSON.stringify(toutesLesdemandes, null, 2));
      res.status(200).json({
        success: true,
        message: 'Demande mise à jour avec succès',
        id: demande.id
      });
      return;
    }

    console.info('POST on /api/demandes, creation ID ...');

    // Sinon, création d'une nouvelle demande
    // Si id est absent, null ou vide, générer un nouvel id
    let id = demande.id;
    if (!id || typeof id !== 'string' || id.trim() === '') {
      id = Date.now().toString();
    }
    const timestamp = new Date().toISOString();
    const demandeComplete = {
      id,
      timestamp,
      ...demande,
      id // assure que l'id généré est bien utilisé
    };

    // Nom du fichier basé sur la date et l'ID
    const fileName = `demande_${new Date().toISOString().split('T')[0]}_${id}.json`;
    const filePath = path.join(dataDir, fileName);

    // Écrire le fichier JSON
    fs.writeFileSync(filePath, JSON.stringify(demandeComplete, null, 2));

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
      let demandes = JSON.parse(data);
      // Filtrer les demandes avec une date de livraison valide
      // demandes = demandes.filter(demande => demande.deliveryDate && demande.deliveryDate.trim() !==

      // Trier par deliveryDate ascendant (date la plus proche en premier)
      demandes.sort((a, b) => {
        // Si une des dates est manquante, la placer à la fin
        if (!a.deliveryDate && !b.deliveryDate) return 0;
        if (!a.deliveryDate) return 1;
        if (!b.deliveryDate) return -1;
        // Comparer les dates
        return new Date(a.deliveryDate) - new Date(b.deliveryDate);
      });

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

// Mettre à jour une demande existante
app.put('/api/demandes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const allDemandesPath = path.join(dataDir, 'toutes_demandes.json');
    if (!fs.existsSync(allDemandesPath)) {
      return res.status(404).json({ success: false, message: 'Aucune demande trouvée' });
    }
    const data = fs.readFileSync(allDemandesPath, 'utf8');
    let demandes = JSON.parse(data);
    const idx = demandes.findIndex(d => d.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée' });
    }
    demandes[idx] = { ...demandes[idx], ...updatedData, id }; // conserve l'id
    fs.writeFileSync(allDemandesPath, JSON.stringify(demandes, null, 2));
    res.json({ success: true, message: 'Demande mise à jour' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour', error: error.message });
  }
});

// Supprimer une demande existante
app.delete('/api/demandes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const allDemandesPath = path.join(dataDir, 'toutes_demandes.json');
    if (!fs.existsSync(allDemandesPath)) {
      return res.status(404).json({ success: false, message: 'Aucune demande trouvée' });
    }
    const data = fs.readFileSync(allDemandesPath, 'utf8');
    let demandes = JSON.parse(data);
    const newDemandes = demandes.filter(d => d.id !== id);
    if (newDemandes.length === demandes.length) {
      return res.status(404).json({ success: false, message: 'Demande non trouvée' });
    }
    fs.writeFileSync(allDemandesPath, JSON.stringify(newDemandes, null, 2));
    res.json({ success: true, message: 'Demande supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la suppression', error: error.message });
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
