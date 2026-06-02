package com.lfn.icip.icipwebeditor.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.lfn.icip.icipwebeditor.model.AgentDirectory;
import com.lfn.icip.icipwebeditor.model.AgentToolParameter;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

// ...existing imports...

@Entity
@Setter
@Getter
@NoArgsConstructor
@Table(name = "tools", schema = "essedum_coredb")
// ...existing annotations...
public class AgentTool implements Serializable {

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

    @OneToMany(mappedBy = "tool", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty("parameters")
    private List<AgentToolParameter> parameters = new ArrayList<>();


}

