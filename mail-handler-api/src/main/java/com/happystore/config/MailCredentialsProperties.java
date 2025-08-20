package com.happystore.config;

import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Configuration
@ConfigurationProperties(prefix = "credentials")
@Component
@Slf4j
public class MailCredentialsProperties {

        private Map<String, MailCredential> mail;

        public Map<String, MailCredential> getMail() {
            return mail;
        }

        public void setMail(Map<String, MailCredential> mail) {
            this.mail = mail;
        }
    
    // POJO for credential value
    public static class MailCredential {
        private String username;
        private String password;

        // getters and setters
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    @PostConstruct
    public void init() {
        log.info("MailCredentialsProperties initialized");
        if (this.mail == null) {
            log.error("Credentials map is null! Check your application.properties/yml configuration.");
            log.error("Make sure you have credentials.mail.credentials.* properties defined");
        } else {
            log.info("Found {} credential entries", this.mail.size());
            this.mail.forEach((key, value) -> 
                log.info("Credential key: {}, username exists: {}", 
                    key, value != null && value.getUsername() != null));
        }
    }
}
