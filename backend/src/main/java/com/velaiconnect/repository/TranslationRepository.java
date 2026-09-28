package com.velaiconnect.repository;

import com.velaiconnect.model.Translation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TranslationRepository extends JpaRepository<Translation, UUID> {
    List<Translation> findByLocale(String locale);
    Optional<Translation> findByKeyAndLocale(String key, String locale);
}
