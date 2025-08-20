package com.happystore.mail.receiver;

public interface MailHandler {
    String getSender();
    void handle(String emailContent);
}
