package com.lfn.icip.icipwebeditor.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.lfn.icip.icipwebeditor.model.AgentDirectory;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

// ...existing imports...

@Entity
@Table(name = "signatures", schema = "essedum_coredb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AgentSignature implements Serializable {

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

    @Column(name = "algorithm", length = 64)
    @JsonProperty("algorithm")
    private String algorithm;

    @Column(name = "value", length = 512)
    @JsonProperty("value")
    private String value;

    @Column(name = "certificate", length = 256)
    @JsonProperty("certificate")
    private String certificate;
}

