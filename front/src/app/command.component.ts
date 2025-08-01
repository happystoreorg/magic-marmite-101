import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


interface DemandeLocation {
  // Étape 1 - Informations client
  clientName: string;
  platform: string;
  contactDate: string;
  comments: string;
  phone: string;
  
  // Étape 2 - Détails de la commande
  color: string;
  unitPrice: number;
  quantity: number;
  fireFee: number;
  shippingFee: number;
  deliveryDate: string;
  
  // Étape 3 - Paiement et retour
  advance: number;
  returnStatus: string;
  deposit: number;
}

@Component({
  selector: 'app-command',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.css']
})
export class CommandComponent {
  step = 1;
  activeTab = 'board';

  private readonly apiUrl = 'http://localhost:3001/api';
  
  // Objet pour stocker les données du formulaire
  formData: DemandeLocation = {
    clientName: '',
    platform: '',
    contactDate: '',
    comments: '',
    phone: '',
    color: '',
    unitPrice: 0,
    quantity: 1,
    fireFee: 0,
    shippingFee: 0,
    deliveryDate: '',
    advance: 0,
    returnStatus: '',
    deposit: 0
  };
  
  // État de soumission
  isSubmitting = false;
  submitMessage = '';

  // Liste de toutes les demandes pour l'onglet "A VENIR"
  allDemandes: any[] = [];

  // Demande sélectionnée pour édition
  selectedDemande: any = null;

  constructor(private readonly http: HttpClient) {}

  ngOnInit() {
    this.refreshAllTabs();
  }

  // Surveille le changement d'onglet pour charger les demandes si besoin
  ngDoCheck() {
    // Rafraîchir les données à chaque changement d'onglet
    if (this.lastActiveTab !== this.activeTab) {
      this.lastActiveTab = this.activeTab;
      this.refreshAllTabs();
    }
  }

  // Pour détecter le changement d'onglet
  private lastActiveTab = this.activeTab;

  // Méthode centrale pour rafraîchir tous les tableaux/tabs
  refreshAllTabs() {
    this.loadAllDemandes();
    // Ajoutez ici d'autres méthodes de chargement si vous avez d'autres tableaux à rafraîchir
    // ex: this.loadDashboardStats(); this.loadValidatedDemandes(); etc.
  }

  loadAllDemandes() {
    this.http.get<any[]>(`${this.apiUrl}/demandes`).subscribe({
      next: (data) => {
        this.allDemandes = Array.isArray(data) ? data : [];
        // Si d'autres tableaux utilisent ces données, mettez-les à jour ici aussi
      },
      error: (err) => {
        console.error('Erreur lors du chargement des demandes:', err);
        this.allDemandes = [];
      }
    });
  }

  nextStep() {
    if (this.step < 3) {
      this.step++;
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }
  
  // collectFormData supprimée : le binding ngModel garde les valeurs à jour
  
  // Méthode pour enregistrer la demande
  onSubmitForm(event: Event) {
    event.preventDefault();

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.submitMessage = '';

    try {
      // Les données sont déjà à jour dans formData grâce à ngModel
      
      // Validation basique
      if (!this.formData.clientName.trim()) {
        throw new Error('Le nom du client est obligatoire');
      }
      
      if (this.formData.quantity < 1) {
        throw new Error('La quantité doit être d\'au moins 1');
      }
      
      // Envoyer les données au backend
      this.http.post(`${this.apiUrl}/demandes`, this.formData).subscribe({
        next: (result) => {
          console.log('Demande enregistrée:', result);
          this.submitMessage = 'Demande enregistrée avec succès !';

          // Rafraîchir tous les tableaux/tabs après ajout
          this.refreshAllTabs();

          // Réinitialiser le formulaire après succès
          setTimeout(() => {
            this.resetForm();
          }, 2000);
        },
        error: (error) => {
          console.error('Erreur lors de l\'enregistrement:', error);
          this.submitMessage = `Erreur: ${error.message || 'Impossible d\'enregistrer la demande'}`;
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });

    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement:', error);
      this.submitMessage = `Erreur: ${error.message || 'Impossible d\'enregistrer la demande'}`;
      this.isSubmitting = false;
    }
  }
  
  // Méthode pour réinitialiser le formulaire
  resetForm() {
    // Réinitialiser les données
    this.formData = {
      clientName: '',
      platform: '',
      contactDate: '',
      comments: '',
      phone: '',
      color: '',
      unitPrice: 0,
      quantity: 1,
      fireFee: 0,
      shippingFee: 0,
      deliveryDate: '',
      advance: 0,
      returnStatus: '',
      deposit: 0
    };
    
    // Réinitialiser le formulaire HTML
    const form = document.querySelector('form') as HTMLFormElement;
    if (form) {
      form.reset();
    }
    
    // Retourner à l'étape 1
    this.step = 1;
    this.submitMessage = '';
  }

  isDeliverySoon(deliveryDate: string): boolean {
    if (!deliveryDate) return false;
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diffDays = (delivery.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 14;
  }

  onSelectDemande(demande: any) {
    this.selectedDemande = demande;
    // Remplir le formulaire avec les valeurs de la demande sélectionnée
    this.formData = {
      clientName: demande.clientName || '',
      platform: demande.platform || '',
      contactDate: demande.contactDate || '',
      comments: demande.comments || '',
      phone: demande.phone || '',
      color: demande.color || '',
      unitPrice: demande.unitPrice || 0,
      quantity: demande.quantity || 1,
      fireFee: demande.fireFee || 0,
      shippingFee: demande.shippingFee || 0,
      deliveryDate: demande.deliveryDate || '',
      advance: demande.advance || 0,
      returnStatus: demande.returnStatus || '',
      deposit: demande.deposit || 0
    };
    // Aller à l'étape 1 du formulaire pour édition
    this.step = 1;
  }

  // Suppression d'une demande sélectionnée
  deleteSelectedDemande() {
    if (!this.selectedDemande?.id) return;
    if (!confirm('Voulez-vous vraiment supprimer cette demande ?')) return;
    this.http.delete(`${this.apiUrl}/demandes/${this.selectedDemande.id}`).subscribe({
      next: () => {
        this.selectedDemande = null;
        this.refreshAllTabs();
      },
      error: (err) => {
        alert('Erreur lors de la suppression : ' + (err?.message || ''));
      }
    });
  }

  // Mise à jour d'une demande sélectionnée
  updateSelectedDemande() {
    if (!this.selectedDemande?.id) return;
    // On suppose que formData contient les modifications à appliquer
    this.http.put(`${this.apiUrl}/demandes/${this.selectedDemande.id}`, this.formData).subscribe({
      next: () => {
        this.selectedDemande = null;
        this.refreshAllTabs();
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour : ' + (err?.message || ''));
      }
    });
  }
}
