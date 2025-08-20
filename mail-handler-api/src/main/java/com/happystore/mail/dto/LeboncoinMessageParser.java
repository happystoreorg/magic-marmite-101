package com.happystore.mail.dto;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class LeboncoinMessageParser {

    public static LeboncoinMessageDto parse(String raw) throws Exception {
        LeboncoinMessageDto dto = new LeboncoinMessageDto();
        dto.setRawMessage(raw);

        // Nom du destinataire
        dto.setRecipientName(extractFirst(raw, "Bonjour ([A-Za-z_]+)"));

        // Titre de l’annonce (plus robuste, plusieurs essais)
        String adTitle = extractFirst(raw, "Vous avez un nouveau message\\. (.+?) \\d+ €");
        if (adTitle.isEmpty()) {
            // Essai si le prix n'est pas collé au titre
            adTitle = extractFirst(raw, "Vous avez un nouveau message\\. (.+?)(?:\\n|\\r|\\|)");
        }
        if (adTitle.isEmpty()) {
            // Essai si le titre est sur une ligne séparée
            adTitle = extractFirst(raw, "Vous avez un nouveau message\\.[\\s\\|]*([^\n\r|]+)");
        }
        dto.setAdTitle(adTitle);

        // Prix
        dto.setPrice(extractFirst(raw, "(\\d+ €)"));

        // Nom de l’expéditeur (avant « … » ou après le prix)
        // Ancienne règle : dto.setSenderName(extractFirst(raw, "€ ([A-Za-z0-9_]+) «"));
        // Nouvelle règle plus robuste :
        dto.setSenderName(extractFirst(raw, "(?:€\\s*)([A-Za-zÀ-ÖØ-öø-ÿ0-9_'.-]{2,}(?: [A-Za-zÀ-ÖØ-öø-ÿ0-9_'.-]+)*)\\s*«")); // après le prix, avant «
        if (dto.getSenderName().isEmpty()) {
            dto.setSenderName(extractFirst(raw, "([A-Za-zÀ-ÖØ-öø-ÿ0-9_'.-]{2,}(?: [A-Za-zÀ-ÖØ-öø-ÿ0-9_'.-]+)*)\\s*«")); // juste avant «
        }
        if (dto.getSenderName().isEmpty()) {
            // Pour les formats multi-lignes ou séparés par des retours à la ligne
            dto.setSenderName(extractFirst(raw, "(?:\\n|\\r|\\|)\\s*([A-Za-zÀ-ÖØ-öø-ÿ0-9_'.-]{2,}(?: [A-Za-zÀ-ÖØ-öø-ÿ0-9_'.-]+)*)\\s*\\n\\s*«"));
        }

        // Message principal (entre guillemets français)
        dto.setSenderMessage(extractFirst(raw, "«([^\"]+)»"));

        // Date demandée (ex: Pour le 19 juillet, pour le 3/07, samedi 09/08)
        dto.setRequestedDate(extractFirst(raw, "Pour le ([^\\?]+)\\?"));
        if (dto.getRequestedDate().isEmpty()) {
            dto.setRequestedDate(extractFirst(raw, "pour le ([^\\?]+)\\?"));
        }
        if (dto.getRequestedDate().isEmpty()) {
            dto.setRequestedDate(extractFirst(raw, "samedi ([0-9/]+)"));
        }

        // Heure demandée
        dto.setRequestedHour(extractFirst(raw, "quel heure seriez vous disponible \\?"));

        // Numéro de téléphone (commence par 06 ou 07 uniquement)
        dto.setPhoneNumber(extractFirst(raw, "(0[67](?:[ .-]?\\d{2}){4})"));

        // Historique des échanges
        dto.setPreviousMessages(extractFirst(raw, "Messages précédents leboncoin(.+)L'équipe leboncoin"));

        // Détection de la présence de "Messages précédents" après "Répondre dans la messagerie"
        int idxRepondre = raw.indexOf("Répondre dans la messagerie");
        boolean hasPreviousMessages = false;
        if (idxRepondre != -1) {
            String afterRepondre = raw.substring(idxRepondre);
            hasPreviousMessages = afterRepondre.contains("Messages précédents");
        }
        dto.setHasPreviousMessages(hasPreviousMessages);

        // Signature
        dto.setSignature(extractFirst(raw, "L'équipe leboncoin"));

        // Désinscription
        dto.setUnsubscribeLink(extractFirst(raw, "Si vous ne souhaitez plus recevoir d'email de la part de leboncoin, cliquez ici"));

        // CGU
        dto.setTermsLink(extractFirst(raw, "Accès à nos conditions générales d’utilisation"));

        return dto;
    }

    private static String extractFirst(String text, String regex) throws Exception {
        Pattern pattern = Pattern.compile(regex, Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            if (matcher.groupCount() >= 1 && matcher.group(1) != null) {
                return matcher.group(1).trim();
            }
        }
        return "";
    }

    
}