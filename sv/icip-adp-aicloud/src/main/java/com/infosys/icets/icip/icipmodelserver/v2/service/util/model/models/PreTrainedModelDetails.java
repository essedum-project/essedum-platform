package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

public class PreTrainedModelDetails {
    private String name;
    private String version;
    private Artifacts artifacts;
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getVersion() {
        return version;
    }
    public void setVersion(String version) {
        this.version = version;
    }
    public Artifacts getArtifacts() {
        return artifacts;
    }
    public void setArtifacts(Artifacts artifacts) {
        this.artifacts = artifacts;
    }
}
