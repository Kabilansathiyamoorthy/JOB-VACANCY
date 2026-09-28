package com.velaiconnect.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "job_skills", uniqueConstraints = @UniqueConstraint(columnNames = {"job_id", "skill"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class JobSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(nullable = false, length = 80)
    private String skill;
}
