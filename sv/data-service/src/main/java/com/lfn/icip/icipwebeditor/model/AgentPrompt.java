package com.lfn.icip.icipwebeditor.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.lfn.icip.icipwebeditor.model.AgentDirectory;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

// ...existing imports...

@Entity
@Table(name = "prompts", schema = "essedum_coredb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AgentPrompt implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @JsonProperty("id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "entity_id", nullable = false)
    @JsonIgnore
    private AgentDirectory agent;

    @Column(name = "name", length = 128)
    @JsonProperty("name")
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;
}

