package com.happystore.mail.receiver;

import com.happystore.mail.dto.DemandeDto;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Component
public class DemandeRestClient {

    private final RestTemplate restTemplate;
    private final String demandesApiUrl;

    public DemandeRestClient(@Value("${demandes.api.url}") String demandesApiUrl) {
        this.restTemplate = new RestTemplate();
        this.demandesApiUrl = demandesApiUrl;
    }

    public ResponseEntity<String> sendDemande(List<DemandeDto> demandeDtos) {
        String url = this.demandesApiUrl;
        for (DemandeDto demandeDto : demandeDtos) {
            restTemplate.postForEntity(url, demandeDto, String.class);
        }
        return ResponseEntity.ok("Demandes envoyées");
    }

    public ResponseEntity<List<DemandeDto>> getAllDemandes() {
        String url = this.demandesApiUrl;
        return restTemplate.exchange(
            url,
            org.springframework.http.HttpMethod.GET,
            null,
            new org.springframework.core.ParameterizedTypeReference<List<DemandeDto>>() {}
        );
    }
}
