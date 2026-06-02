package com.lfn.icip.icipwebeditor.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

/**
 * The Class AgentExtension.
 */
@Entity
@Table(name = "extensions", schema = "essedum_coredb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AgentExtension implements Serializable {

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

    @Column(name = "ext_key", length = 128)
    @JsonProperty("ext_key")
    private String extKey;

    @Column(name = "ext_value", length = 1024)
    @JsonProperty("ext_value")
    private String extValue;

    @Column(name = "description", columnDefinition = "TEXT")
    @JsonProperty("description")
    private String description;
}

