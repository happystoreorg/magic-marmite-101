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
  
  // URL du backend
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

  constructor(private readonly http: HttpClient) {}

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
}
