package com.happystore.mail.sender;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;


import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MailSenderService {

    private final JavaMailSender mailSender;

    // private final String envVar1 = System.getenv("ENV_VAR_1");
    @Value("${hairdresser.test}")
    private String envVar1;

    @Autowired
    public MailSenderService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        log.info("Env var ENV_VAR_1 {}", envVar1);
        try {

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to.split(","));
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }

    }

    public void sendHtmlEmail(String to, String subject, String htmlBody, List<String> bcc) {

        log.info("Sending HTML email to: {}, Subject: {}", to, subject);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to.split(","));
            helper.setBcc(bcc.toArray(new String[0]));
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = isHtml
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 5 ? * TUE,FRI,SUN")
    public void sendDailyHtmlEmail() {
        log.info("Scheduled task for sendDailyHtmlEmail executed at {}", LocalDateTime.now());
        String htmlBody;
        List<String> allUserEmails;

    String subject = LocalDateTime.now().toLocalDate() + " - [Test in Progress] " +  " - GENTILLY 2025 DAILY MAIL HANDLER";

        try {
            htmlBody = "";
            htmlBody = """
                        <html>

<head>
    <meta charset="UTF-8" />
</head>

<body style="
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      padding: 20px;
    ">
    <div style="
        max-width: 1600px;
        margin: auto;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px #eee;
        padding: 24px;
      ">
    <h2 style="color: #000">DAILY MAIL HANDLER</h2>
        <h4>Pôle Tech</h4>
        <hr style="border: none; border-top: 1px solid #aa761a" />
        <div style="padding: 3px; background: #b4b9b7">
            <p>-</p>
        </div>

        <h4>Pôle Solidarité</h4>
        <hr style="border: none; border-top: 1px solid #aa761a" />
        <div style="padding: 3px; background: #b4b9b7">
            <p>-</p>
        </div>
        <h4>Pôle Bourse</h4>
        <hr style="border: none; border-top: 1px solid #aa761a" />
        <div style="padding: 3px; background: #b4b9b7">
            <p>
                -
            </p>
        </div>
        <h4>Pôle Foncier au Cameroun</h4>
        <hr style="border: none; border-top: 1px solid #aa761a" />
        <div style="padding: 3px; background: #b4b9b7">
            <p>-</p>
        </div>

        <p>Merci de faire partie de cette communauté !</p>
        <hr style="border: none; border-top: 1px solid #eee" />
        <p style="font-size: 12px; color: #888">
            Vous recevez ce courriel car vous êtes membre du club d'investissement
            Gentilly 2025.
        </p>
    </div>
</body>

</html>
                    """;
            allUserEmails = List.of("clubinvestgentilly2025@gmail.com");
            sendHtmlEmail("clubinvestgentilly2025@gmail.com", subject, htmlBody, allUserEmails);
        } catch (Exception e) {
            log.error("Failed to load or send daily HTML email: {}", e.getMessage());
        }
    }

}
