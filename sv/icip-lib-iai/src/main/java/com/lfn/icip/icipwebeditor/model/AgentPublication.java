package com.lfn.icip.icipwebeditor.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * The Class AgentPublication.
 */
@Entity
@Table(name = "publications", schema = "essedum_coredb")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AgentPublication implements Serializable {

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

    @Column(name = "channel", length = 128)
    @JsonProperty("channel")
    private String channel;

    @Column(name = "published_date")
    @JsonProperty("published_date")
    private LocalDateTime publishedDate;

    @Column(name = "status", length = 128)
    @JsonProperty("status")
    private String status;
}

