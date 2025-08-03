import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';


interface DemandeLocation {
  // Étape 1 - Informations client
  clientName: string;
  platform: string;
  contactDate: string;
  comments: string;
  phone: string;
  
  // Étape 2 - Détails de la commande
  article: string;
  unitPrice: number;
  quantity: number;
  fireFee: number;
  deliveryDate: string;
  
  // Étape 3 - Paiement et retour
  advance: number;
  returnStatus: string;
  shippingFee: number;

  // Liste des articles pour la commande
  items: Array<{
    article: string;
    unitPrice: number;
    quantity: number;
    fireFee: number;
    shippingFee: number;
    deposit: number; // Ajout du champ deposit pour chaque item
  }>;
}

@Component({
  selector: 'app-command',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './command.component.html',
  styleUrls: ['./command.component.css']
})
export class CommandComponent implements OnInit {
  step = 1;
  activeTab = 'exploitation'; // Onglet actif par défaut

  // Utilisation dynamique de l'URL API selon l'environnement
  private readonly apiUrl = 'http://localhost:3001/api';
  private readonly apiUrlCible = 'http://192.168.1.180:3000/api';

  get apiEndpoint(): string {
    return this.apiUrlCible; // Utilise l'URL définie dans environment.ts ou environment.prod.ts
  }

  // Objet pour stocker les données du formulaire
  formData: DemandeLocation = {
    clientName: '',
    platform: '',
    contactDate: '',
    comments: '',
    phone: '',
    article: '',
    unitPrice: 0,
    quantity: 1,
    fireFee: 0,
    shippingFee: 0,
    deliveryDate: '',
    advance: 0,
    returnStatus: '',
    items: [
      {
        article: '',
        unitPrice: 0,
        quantity: 1,
        fireFee: 0,
        shippingFee: 0,
        deposit: 0 // Ajout du champ deposit pour chaque item
      }
    ]
  };
  
  // État de soumission
  isSubmitting = false;
  submitMessage = '';

  // Liste de toutes les demandes pour l'onglet "A VENIR"
  allDemandes: any[] = [];
  paginatedDemandes: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 1;

  // Demande sélectionnée pour édition
  selectedDemande: any = null;

  // Listes statiques pour les champs platform et article
  readonly platformOptions = [
    'Leboncoin | Sara_',
    'Leboncoin | Nono', 
    'Leboncoin | Kim_',
    'Facebook | Sonia', 
    'Facebook | Arun', 
    'Direct | Arnold',
    'Direct | Nora',  
    'Autre'
  ];

  readonly articleOptions = [
    'Chauffe-plat doré circulaire', 
    'Chauffe-plat argenté rectangulaire', 
    'Gel combustible', 
    'Seau à champagne acrylique sombre', 
    'Seau à champagne acrylique clair', 
    'Cube de présentation transparent',
    'Cube de présentation blanc',
    'Autre'
  ];

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
    this.http.get<any[]>(`${this.apiEndpoint}/demandes`).subscribe({
      next: (data) => {
        this.allDemandes = Array.isArray(data) ? data : [];
        this.updatePagination();
        // Si d'autres tableaux utilisent ces données, mettez-les à jour ici aussi
      },
      error: (err) => {
        console.error('Erreur lors du chargement des demandes:', err);
        this.allDemandes = [];
      }
    });
  }

  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.allDemandes.length / this.pageSize));
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedDemandes = this.allDemandes.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
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
      this.http.post(`${this.apiEndpoint}/demandes`, this.formData).subscribe({
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
      article: '',
      unitPrice: 0,
      quantity: 1,
      fireFee: 0,
      shippingFee: 0,
      deliveryDate: '',
      advance: 0,
      returnStatus: '',
      items: [
        {
          article: '',
          unitPrice: 0,
          quantity: 1,
          fireFee: 0,
          shippingFee: 0,
          deposit: 0 // Ajout du champ deposit pour chaque item
        }
      ]
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
      article: demande.article || '',
      unitPrice: demande.unitPrice || 0,
      quantity: demande.quantity || 1,
      fireFee: demande.fireFee || 0,
      shippingFee: demande.shippingFee || 0,
      deliveryDate: demande.deliveryDate || '',
      advance: demande.advance || 0,
      returnStatus: demande.returnStatus || '',
      items: (demande.items || [
        {
          article: '',
          unitPrice: 0,
          quantity: 1,
          fireFee: 0,
          shippingFee: 0,
          deposit: 0
        }
      ]).map((item: any) => ({
        ...item,
        deposit: item.deposit || 0
      }))
    };
    // Aller à l'étape 1 du formulaire pour édition
    this.step = 1;
  }

  // Suppression d'une demande sélectionnée
  deleteSelectedDemande() {
    if (!this.selectedDemande?.id) return;
    if (!confirm('Voulez-vous vraiment supprimer cette demande ?')) return;
    this.http.delete(`${this.apiEndpoint}/demandes/${this.selectedDemande.id}`).subscribe({
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
    this.http.put(`${this.apiEndpoint}/demandes/${this.selectedDemande.id}`, this.formData).subscribe({
      next: () => {
        this.selectedDemande = null;
        this.refreshAllTabs();
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour : ' + (err?.message || ''));
      }
    });
  }

  addItem() {
    this.formData.items.push({
      article: '',
      unitPrice: 0,
      quantity: 1,
      fireFee: 0,
      shippingFee: 0,
      deposit: 0 // Ajout du champ deposit pour chaque item
    });
  }

  removeItem(index: number) {
    if (this.formData.items.length > 1) {
      this.formData.items.splice(index, 1);
    }
  }

  getTotalAmount(demande: any): number {
    if (!demande.items || !Array.isArray(demande.items)) return 0;
    return demande.items.reduce((sum: number, item: { unitPrice: number; quantity: number; }) => {
      const unitPrice = Number(item.unitPrice) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + unitPrice * quantity;
    }, 0);
  }

  getTotalCaution(demande: any): number {
    if (!demande.items || !Array.isArray(demande.items)) return 0;
    return demande.items.reduce((sum: number, item: { deposit: number; quantity: number; }) => {
      const cautionAmount = Number(item.deposit) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + cautionAmount * quantity;
    }, 0);
  }

  getReste(demande: any): number {
    if (!demande || typeof demande.advance !== 'number' || typeof demande.totalAmount !== 'number') {
      // convert to number to avoid NaN issues
      demande.advance = Number(demande.advance) || 0;
      demande.totalAmount = this.getTotalAmount(demande) || 0;
    }
    return demande.totalAmount - demande.advance;
  }

  showRecap = false;

  getRecapMessage(demande: any): string {
    if (!demande) return '';

    const articles = (demande.items || [])
      .map((item: any) => `• ${item.article} x${item.quantity} à ${item.unitPrice}€/unité`)
      .join('\n');

    return (
      `Bonjour ${demande.clientName},
Merci pour votre commande du ${this.formatDate(demande.deliveryDate)}.

Résumé du besoin :
${articles}
__________________
- Total : ${this.getTotalAmount(demande)} €
- Avance versée : ${demande.advance} €
- Reste à régler : ${this.getReste(demande)} €

Récupération prévue avant le: ${this.formatDate(demande.deliveryDate)}
La caution d'un montant de : ${this.getTotalCaution(demande)} € sera déposée lors de la récupération des articles.

Pour rappel, les articles sont à retourner dans un état propre et fonctionnel.
En cas de non-retour propre et fonctionnel, la caution sera conservée.

Nous restons à votre disposition pour toute question.
Cordialement.
      `
    );
  }

  private formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toISOString().slice(0, 10);
  }

  // ...existing code...
}
