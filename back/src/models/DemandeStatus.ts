export enum DemandeStatus {
  INIT = 'INIT', // Création initiale
  PENDING = 'PENDING', // En attente d'informations ou de confirmation
  CONFIRMED = 'CONFIRMED', // Commande confirmée
  DELIVERED = 'DELIVERED', // Matériel livré
  RETURNED = 'RETURNED', // Matériel restitué
  ARCHIVED = 'ARCHIVED', // Demande clôturée
  CANCELLED = 'CANCELLED' // Demande annulée
}

