package com.happystore.mail.receiver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/mail-receiver")
@Slf4j
public class MailReceiverController {
    private final MailReceiverService mailReceiverService;

    @Autowired
    public MailReceiverController(MailReceiverService mailReceiverService) {
        this.mailReceiverService = mailReceiverService;
    }

    @PostMapping("/check-inbox")
    public ResponseEntity<String> checkInbox() {
        try {
            mailReceiverService.processAllInboxes();
            return ResponseEntity.ok("Inbox checked and actions performed.");
        } catch (Exception e) {
            log.error(null, e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
    