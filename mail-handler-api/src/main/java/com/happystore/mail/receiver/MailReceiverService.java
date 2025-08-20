package com.happystore.mail.receiver;

import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.search.FlagTerm;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.happystore.config.MailCredentialsProperties;
import com.happystore.mail.dto.DemandeDto;

import java.io.File;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class MailReceiverService {

    private final Map<String, MailHandler> handlerMap;

    @Autowired
    private DemandeRestClient demandeRestClient;

    @Autowired
    MailCredentialsProperties mailCredentialsProperties;

    @Value("${spring.mail.host}")
    private String defaultHost;
    @Value("${spring.mail.port}")
    private int defaultPort;

    // Track processed Message-IDs
    private final Set<String> processedMessageIds = ConcurrentHashMap.newKeySet();

    @Autowired
    public MailReceiverService(List<MailHandler> handlers) {
        if (handlers == null) {
            handlers = java.util.Collections.emptyList();
        }
        this.handlerMap = handlers.stream().collect(
            java.util.stream.Collectors.toMap(MailHandler::getSender, h -> h)
        );
    }

    // while loop on all credentials
    public void processAllInboxes() throws Exception {
        for (Map.Entry<String, MailCredentialsProperties.MailCredential> entry : mailCredentialsProperties.getMail().entrySet()) {
            String key = entry.getKey();
            log.info("Processing inbox for credentials key: {}", key);
            checkInbox(key);
        }
    }

    // checkInbox accepte une clé pour choisir le jeu d'identifiants
    public void checkInbox(String credentialsKey) throws Exception {
        log.info("Checking inbox with credentials: {}", credentialsKey);
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        Session session = Session.getDefaultInstance(props, null);

        Store store = session.getStore("imaps");
        store.connect(defaultHost, 
                    defaultPort, 
                    mailCredentialsProperties.getMail().get(credentialsKey).getUsername(), 
                    mailCredentialsProperties.getMail().get(credentialsKey).getPassword());

        getUnreadMessages(store);
        store.close();
    }

    private void getUnreadMessages(Store store) throws MessagingException, Exception {

                    
        // Récupérer les demandes déjà enregistrées
        retreiveLastDemandeFromJsApplication();
        
        Folder inbox = store.getFolder("INBOX");
        inbox.open(Folder.READ_ONLY);

        Message[] unreadMessages = inbox.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));
        for (Message message : unreadMessages) {
            String messageId = ((MimeMessage) message).getMessageID();
            if (processedMessageIds.contains(messageId)) {
                continue; // Skip already processed
            }

            String from = ((MimeMessage) message).getFrom()[0].toString();
            log.info("Processing message from: {}", from);

            String content = extractTextFromMessage(message);
            for (String sender : handlerMap.keySet()) {
                if (from.contains(sender) || from.contains("messagerie.leboncoin.fr")) {
                    log.info("Found handler for sender: [ {} ]", from);
                    handlerMap.get(sender).handle(content);
                }
            }
            processedMessageIds.add(messageId); // Mark as processed
        }
        inbox.close(false);
        
        pushDemandesWithApi1();

    }

    private String extractTextFromMessage(Message message) throws Exception {
        if (message == null) return "";

        // Si c'est une instance de Multipart, traiter récursivement
        if (message.isMimeType("multipart/*")) {
            Multipart multipart = (Multipart) message.getContent();
            return extractTextFromMultipart(multipart);
        }

        // Si c'est une instance de MimeMessage ou IMAPMessage, traiter comme MimeMessage
        if (message instanceof MimeMessage) {
            Object content = message.getContent();
            if (content instanceof Multipart) {
                return extractTextFromMultipart((Multipart) content);
            } else if (content instanceof String) {
                if (message.isMimeType("text/plain")) {
                    return (String) content;
                } else if (message.isMimeType("text/html")) {
                    return org.jsoup.Jsoup.parse((String) content).text();
                }
            }
        }

        // Fallback pour les autres types
        Object content = message.getContent();
        if (content instanceof String) {
            return (String) content;
        } else if (content instanceof Multipart) {
            return extractTextFromMultipart((Multipart) content);
        }

        // Si le type est inconnu, retourner une chaîne vide
        return "";
    }

    // Méthode utilitaire pour extraire le texte d'un Multipart
    private String extractTextFromMultipart(Multipart multipart) throws Exception {
        for (int i = 0; i < multipart.getCount(); i++) {
            BodyPart part = multipart.getBodyPart(i);
            if (part.isMimeType("text/plain")) {
                return part.getContent().toString();
            } else if (part.isMimeType("text/html")) {
                return org.jsoup.Jsoup.parse(part.getContent().toString()).text();
            } else if (part.isMimeType("multipart/*")) {
                // Récursivité pour les parties multiples imbriquées
                Object partContent = part.getContent();
                if (partContent instanceof Multipart) {
                    String result = extractTextFromMultipart((Multipart) partContent);
                    if (!result.isEmpty()) return result;
                }
            }
        }
        return "";
    }

    // Démarre un polling sur chaque mailbox pour détecter les changements
    public void startMailboxPolling(long pollingIntervalMillis) {
        // boucle sur les entryset de mailMap et rajoute les dans credential map
        for (Map.Entry<String, MailCredentialsProperties.MailCredential> entry : mailCredentialsProperties.getMail().entrySet()) {
            String key = entry.getKey();
            // MailCredentialsProperties.MailCredential value = entry.getValue();
            new Thread(() -> pollMailbox(key, pollingIntervalMillis)).start();
        }
    }

    // Polling régulier sur une mailbox
    private void pollMailbox(String credentialsKey, long pollingIntervalMillis) {
        int previousCount = -1;
        while (true) {
            try {

                Properties props = new Properties();
                props.put("mail.store.protocol", "imaps");
                Session session = Session.getDefaultInstance(props, null);
            
                Store store = session.getStore("imaps");
                // Connexion avec les identifiants de la clé                
                store.connect(defaultHost,
                    defaultPort,
                    mailCredentialsProperties.getMail().get(credentialsKey).getUsername(),
                    mailCredentialsProperties.getMail().get(credentialsKey).getPassword());

                Folder inbox = store.getFolder("INBOX");
                inbox.open(Folder.READ_ONLY);

                int currentCount = inbox.getMessageCount();
                if (previousCount != -1 && currentCount > previousCount) {
                    log.info("Nouveau message détecté (polling) dans la mailbox: {}", credentialsKey);

                    // Traiter les nouveaux messages
                    getUnreadMessages(store);

                }
                previousCount = currentCount;

                inbox.close(false);
                store.close();

                // Synchroniser les demandes avec l'API

                Thread.sleep(pollingIntervalMillis);

            } catch (Exception ex) {
                log.error("Erreur dans le polling de mailbox {}: {}", credentialsKey, ex.getMessage(), ex);
                try { Thread.sleep(10000); } catch (InterruptedException ignored) {}
            }
        }
    }

    // Stub method to avoid compilation error
    private void retreiveLastDemandeFromJsApplication() {

        log.info("Recuperation des demandes déjà présentent dans l'application afin de conserver la consistance");
        ObjectMapper objectMapper = new ObjectMapper();

        File file = new File("data" + File.separator + "all_demandeDto" + ".json");
        // get all demandes from API Get
        List<DemandeDto> currentDemandes = demandeRestClient.getAllDemandes().getBody();
        
        try {
            objectMapper.writeValue(file, currentDemandes);
        } catch (java.io.IOException e) {
            log.error("Error writing demandes to file: {}", e.getMessage(), e);
        }

    }

        // Stub method to avoid compilation error
    private void pushDemandesWithApi1() {
        // TODO: Implement synchronization logic here
        log.info("Pushing demandes with API...");
        ObjectMapper objectMapper = new ObjectMapper();

        File file = new File("data" + File.separator + "all_demandeDto" + ".json");
        try {
            List<DemandeDto> demandes = Arrays.asList(objectMapper.readValue(file, DemandeDto[].class));
            demandeRestClient.sendDemande(demandes);
        } catch (java.io.IOException e) {
            log.error("Error reading demandes from file: {}", e.getMessage(), e);
        }

    }
}

