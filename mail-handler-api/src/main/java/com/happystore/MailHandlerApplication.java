package com.happystore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Slf4j
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties
public class MailHandlerApplication {
    public static void main(String[] args) {
        SpringApplication.run(MailHandlerApplication.class, args);
    }
}
