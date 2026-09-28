package com.velaiconnect.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "translations", uniqueConstraints = @UniqueConstraint(columnNames = {"key", "locale"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Translation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 160)
    private String key;

    @Column(nullable = false, length = 5)
    private String locale;              // 'en' | 'ta'

    @Column(nullable = false, columnDefinition = "text")
    private String value;
}
