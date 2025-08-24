package com.happystore.mail.receiver;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.core.exc.StreamReadException;
import com.fasterxml.jackson.core.exc.StreamWriteException;
import com.fasterxml.jackson.databind.DatabindException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.happystore.mail.dto.DemandeDto;
import com.happystore.mail.dto.LeboncoinMessageDto;
import com.happystore.mail.dto.LeboncoinMessageParser;
import com.happystore.mail.util.DemandeDTOMapper;

@Component
public class SpecialSenderMailHandler implements MailHandler {
    private static final Logger logger = LoggerFactory.getLogger(SpecialSenderMailHandler.class);

    @Override
    public String getSender() {
        return "gueukam@gmail.com";
    }

    @Override
    public void handle(String emailContent) {

        try {
            // create LeboncoinMessageDto
            LeboncoinMessageDto messageDto = LeboncoinMessageParser.parse(emailContent);

            // Create DemandeDto from messageDto using DemandeMapper
            DemandeDto demandeDto = DemandeDTOMapper.fromLeboncoinMessage(messageDto);

            storeDemande(demandeDto);

            // demandeRestClient.sendDemande(newDemandes);
            
            // Log the stored demande
            logger.info("to {}, Demande stored successfully: -> {}", demandeDto.getPlatform(), demandeDto.getClientName());

        } catch (Exception e) {
            logger.error("Error processing email content: {}", e.getMessage(), e);
        }  
    }

    private List<DemandeDto> storeDemande(DemandeDto demandeDto)
            throws IOException, StreamReadException, DatabindException, StreamWriteException {
        ObjectMapper objectMapper = new ObjectMapper();

        String clientName = demandeDto.getClientName() != null ? demandeDto.getClientName().replaceAll("[^a-zA-Z0-9_-]", "_") : "unknown";
        // File file = new File("all_demandeDto_" + clientName + ".json");
        File file = new File("data" + File.separator + "all_demandeDto" + ".json");
        List<DemandeDto> demandes = new ArrayList<>();

        if (file.exists() && file.length() > 0) {
            demandes = Arrays.asList(objectMapper.readValue(file, DemandeDto[].class));
            demandes = new ArrayList<>(demandes);
        }

        // Fusionner si une demande existe déjà (par exemple, même clientName, contactDate et comments)
        boolean merged = false;
        for (int i = 0; i < demandes.size(); i++) {
            DemandeDto existing = demandes.get(i);
            if (
                //existing.getId().equals(demandeDto.getId()) || 
                existing.getClientName().equals(demandeDto.getClientName()) &&
                existing.getPlatform().equals(demandeDto.getPlatform())
            ) {
                // Fusionner les informations (exemple : concaténer les commentaires, mettre à jour le téléphone si différent)
                String mergedComments = existing.getComments();
                if (!demandeDto.getComments().equals(existing.getComments())) {
                    mergedComments += " ||| " + demandeDto.getComments();
                }
                existing.setComments(mergedComments);

                if (demandeDto.getPhone() != null && !demandeDto.getPhone().isEmpty()) {
                    existing.setPhone(demandeDto.getPhone());
                }
                // Vous pouvez ajouter d'autres champs à fusionner ici
                if (demandeDto.getDeliveryDate() != null && !demandeDto.getDeliveryDate().isEmpty()) {
                    existing.setDeliveryDate(demandeDto.getDeliveryDate());
                }


                demandes.set(i, existing);
                merged = true;
                break;
            }
        }

        if (!merged) {
            demandes.add(demandeDto);
        }

        objectMapper.writeValue(file, demandes);
        return demandes;
    }

    private List<DemandeDto> storeDemandeFromInputDB(List<DemandeDto> demandeDtos)
            throws IOException, StreamReadException, DatabindException, StreamWriteException {
        ObjectMapper objectMapper = new ObjectMapper();

        demandeDtos.forEach(demandeDto -> {
            String clientName = demandeDto.getClientName() != null ? demandeDto.getClientName().replaceAll("[^a-zA-Z0-9_-]", "_") : "unknown";
            File file = new File("data" + File.separator + "demandeDtoDb_" + clientName + ".json");
            List<DemandeDto> demandes = new ArrayList<>();

            if (file.exists() && file.length() > 0) {
            try {
                demandes = Arrays.asList(objectMapper.readValue(file, DemandeDto[].class));
            } catch (StreamReadException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch (DatabindException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
            demandes = new ArrayList<>(demandes);
            }
            demandes.add(demandeDto);
            try {
                objectMapper.writeValue(file, demandes);
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }

        });
        return demandeDtos;
}
}
