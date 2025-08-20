package com.happystore.mail.dto;

import lombok.Data;

@Data
public class LeboncoinMessageDto {
    // Nom du destinataire (ex: Kim_, Sara_)
    private String recipientName;

    // Type d’annonce ou objet (ex: Location plats chauffant, Marmites chauffantes, etc.)
    private String adTitle;

    // Prix de l’annonce (ex: 12 €, 9 €)
    private String price;

    // Nom de l’expéditeur (ex: lesly, Angéla, Gabrielle, Fofana Mama, BOU, aliceleudji9)
    private String senderName;

    // Message principal envoyé par l’expéditeur
    private String senderMessage;

    // Date demandée ou proposée (ex: Pour le 19 juillet, pour le 3/07, samedi 09/08)
    private String requestedDate;

    // Heure demandée ou proposée (si présente)
    private String requestedHour;

    // Numéro de téléphone (si présent dans le message)
    private String phoneNumber;

    // Historique des échanges (si présent)
    private String previousMessages;

    // Signature ou équipe (ex: L'équipe leboncoin)
    private String signature;

    // Lien de désinscription (si présent)
    private String unsubscribeLink;

    // Conditions générales d’utilisation (si présent)
    private String termsLink;

    // Message brut original (pour archivage ou debug)
    private String rawMessage;

    // Indique si "Messages précédents" est présent après "Répondre dans la messagerie"
    private boolean hasPreviousMessages;
}