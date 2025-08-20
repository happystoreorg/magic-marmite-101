package com.happystore.mail.dto;

import lombok.Data;
import java.util.List;

@Data
public class DemandeDto {
    private String id;
    private String timestamp;
    private String clientName;
    private String platform;
    private String contactDate;
    private String comments;
    private String phone;
    private String deliveryDate;
    private double advance;
    private String returnStatus;
    private List<ItemDto> items;

    @Data
    public static class ItemDto {
        private String article;
        private double unitPrice;
        private int quantity;
        private double deposit;
    }

    // Indique si "Messages précédents" est présent après "Répondre dans la messagerie"
    private boolean hasPreviousMessages;
}