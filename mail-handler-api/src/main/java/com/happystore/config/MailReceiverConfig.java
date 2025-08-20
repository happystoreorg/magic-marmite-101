// Configuration pour le service de réception d'e-mails
package com.happystore.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

import com.happystore.mail.receiver.MailReceiverService;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class MailReceiverConfig {

    @Autowired
    MailReceiverService mailReceiverService;

    @PostConstruct
    public void initMailboxPolling() {
        log.info("Initialisation du polling des boîtes aux lettres...");
        mailReceiverService.startMailboxPolling(60000); // Polling toutes les 60 secondes au démarrage
    }
}
