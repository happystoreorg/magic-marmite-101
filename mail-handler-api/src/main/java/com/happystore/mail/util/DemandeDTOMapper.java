package com.happystore.mail.util;

import com.happystore.mail.dto.LeboncoinMessageDto;

import lombok.extern.slf4j.Slf4j;

import com.happystore.mail.dto.DemandeDto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Collections;

@Slf4j
public class DemandeDTOMapper {

    public static DemandeDto fromLeboncoinMessage(LeboncoinMessageDto msg) {

        DemandeDto demande = new DemandeDto();

        // Génération d'un id unique (exemple)
        // demande.setId(String.valueOf(System.currentTimeMillis()));

        // Timestamp actuel
        demande.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        // Extraction des champs pertinents
        demande.setClientName(msg.getSenderName());
        demande.setPlatform(msg.getRecipientName() + " | " + msg.getAdTitle());
        demande.setContactDate(LocalDateTime.now().toLocalDate().toString());
        demande.setComments("\n" + LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME) + " : " + msg.getSenderMessage());
        demande.setPhone(msg.getPhoneNumber());
        demande.setDeliveryDate(parseRequestedDate(msg.getRequestedDate()));
        demande.setAdvance(0); // À adapter si tu peux extraire
        demande.setReturnStatus("non"); // À adapter si tu peux extraire

        // Items (exemple, à enrichir si tu peux parser plusieurs articles)
        DemandeDto.ItemDto item = new DemandeDto.ItemDto();
        item.setArticle(msg.getAdTitle());
        item.setUnitPrice(parsePrice(msg.getPrice()));
        item.setQuantity(1);
        item.setDeposit(0);

        demande.setItems(Collections.singletonList(item));

        return demande;
    }

    private static double parsePrice(String priceStr) {
        if (priceStr == null)
            return 0;
        priceStr = priceStr.replace("€", "").replace(",", ".").trim();
        try {
            return Double.parseDouble(priceStr);
        } catch (Exception e) {
            return 0;
        }
    }

private static String parseRequestedDate(String dateStr) {
    if (dateStr == null || dateStr.isEmpty())
        return "";

    String original = dateStr.trim();
    String cleaned = original;

    // Remove day names (e.g., "samedi", "dimanche", etc.)
    cleaned = cleaned.replaceAll("^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\\s+", "")
                     .replaceAll("^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\\s+", "");

    int currentYear = LocalDate.now().getYear();

    // Try with year appended if missing
    String[] patterns = {
        "d MMMM yyyy", // 19 juillet 2025
        "d MMMM",      // 19 juillet
        "d/M/yyyy",    // 09/08/2025
        "d/M",         // 09/08
        "dd/MM/yyyy",  // 09/08/2025
        "dd/MM",       // 09/08
        "yyyy-MM-dd"   // 2025-07-19
    };

    // Try with year appended if missing
    for (String pattern : patterns) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern).withLocale(java.util.Locale.FRENCH);
            String toParse = cleaned;
            if ((pattern.contains("yyyy") || pattern.contains("yyyy")) && !cleaned.matches(".*\\d{4}.*")) {
                // If pattern expects year but it's missing, append current year
                if (pattern.equals("d MMMM yyyy") && cleaned.matches("\\d{1,2} [A-Za-zéû]+")) {
                    toParse = cleaned + " " + currentYear;
                } else if ((pattern.equals("d/M/yyyy") || pattern.equals("dd/MM/yyyy")) && cleaned.matches("\\d{1,2}/\\d{1,2}")) {
                    toParse = cleaned + "/" + currentYear;
                }
            }
            LocalDate date = LocalDate.parse(toParse, formatter);
            return date.format(DateTimeFormatter.ISO_LOCAL_DATE); // yyyy-MM-dd
        } catch (DateTimeParseException ignored) {}
    }

    log.warn("Date non reconnue ou non convertible au format yyyy-MM-dd : {}", dateStr);
    return "";
}
}
