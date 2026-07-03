
package com.lfn.icip.icipmodelserver.model.dto;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "createdBy",
    "updatedBy",
    "createdOn",
    "modifiedOn",
    "isDeleted",
    "projectId",
    "pipelineId",
    "trialId",
    "name",
    "version",
    "description",
    "status",
    "modelType",
    "framework",
    "modelFrameworkVersion",
    "modelArchitecture",
    "inputMode",
    "modelDir",
    "pushToCodestore",
    "metadata"
})
@Generated("jsonschema2pojo")
public class ICIPModels {

    @JsonProperty("createdBy")
    private String createdBy;
    @JsonProperty("updatedBy")
    private String updatedBy;
    @JsonProperty("createdOn")
    private String createdOn;
    @JsonProperty("modifiedOn")
    private String modifiedOn;
    @JsonProperty("isDeleted")
    private Boolean isDeleted;
    @JsonProperty("projectId")
    private String projectId;
    @JsonProperty("pipelineId")
    private Object pipelineId;
    @JsonProperty("trialId")
    private Object trialId;
    @JsonProperty("name")
    private String name;
    @JsonProperty("version")
    private String version;
    @JsonProperty("description")
    private String description;
    @JsonProperty("status")
    private String status;
    @JsonProperty("modelType")
    private String modelType;
    @JsonProperty("framework")
    private String framework;
    @JsonProperty("modelFrameworkVersion")
    private String modelFrameworkVersion;
    @JsonProperty("modelArchitecture")
    private String modelArchitecture;
    @JsonProperty("inputMode")
    private String inputMode;
    @JsonProperty("modelDir")
    private String modelDir;
    @JsonProperty("pushToCodestore")
    private Boolean pushToCodestore;
    @JsonProperty("metadata")
    private Metadata metadata;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("createdBy")
    public String getCreatedBy() {
        return createdBy;
    }

    @JsonProperty("createdBy")
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public ICIPModels withCreatedBy(String createdBy) {
        this.createdBy = createdBy;
        return this;
    }

    @JsonProperty("updatedBy")
    public String getUpdatedBy() {
        return updatedBy;
    }

    @JsonProperty("updatedBy")
    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }

    public ICIPModels withUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
        return this;
    }

    @JsonProperty("createdOn")
    public String getCreatedOn() {
        return createdOn;
    }

    @JsonProperty("createdOn")
    public void setCreatedOn(String createdOn) {
        this.createdOn = createdOn;
    }

    public ICIPModels withCreatedOn(String createdOn) {
        this.createdOn = createdOn;
        return this;
    }

    @JsonProperty("modifiedOn")
    public String getModifiedOn() {
        return modifiedOn;
    }

    @JsonProperty("modifiedOn")
    public void setModifiedOn(String modifiedOn) {
        this.modifiedOn = modifiedOn;
    }

    public ICIPModels withModifiedOn(String modifiedOn) {
        this.modifiedOn = modifiedOn;
        return this;
    }

    @JsonProperty("isDeleted")
    public Boolean getIsDeleted() {
        return isDeleted;
    }

    @JsonProperty("isDeleted")
    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public ICIPModels withIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
        return this;
    }

    @JsonProperty("projectId")
    public String getProjectId() {
        return projectId;
    }

    @JsonProperty("projectId")
    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public ICIPModels withProjectId(String projectId) {
        this.projectId = projectId;
        return this;
    }

    @JsonProperty("pipelineId")
    public Object getPipelineId() {
        return pipelineId;
    }

    @JsonProperty("pipelineId")
    public void setPipelineId(Object pipelineId) {
        this.pipelineId = pipelineId;
    }

    public ICIPModels withPipelineId(Object pipelineId) {
        this.pipelineId = pipelineId;
        return this;
    }

    @JsonProperty("trialId")
    public Object getTrialId() {
        return trialId;
    }

    @JsonProperty("trialId")
    public void setTrialId(Object trialId) {
        this.trialId = trialId;
    }

    public ICIPModels withTrialId(Object trialId) {
        this.trialId = trialId;
        return this;
    }

    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
    }

    public ICIPModels withName(String name) {
        this.name = name;
        return this;
    }

    @JsonProperty("version")
    public String getVersion() {
        return version;
    }

    @JsonProperty("version")
    public void setVersion(String version) {
        this.version = version;
    }

    public ICIPModels withVersion(String version) {
        this.version = version;
        return this;
    }

    @JsonProperty("description")
    public String getDescription() {
        return description;
    }

    @JsonProperty("description")
    public void setDescription(String description) {
        this.description = description;
    }

    public ICIPModels withDescription(String description) {
        this.description = description;
        return this;
    }

    @JsonProperty("status")
    public String getStatus() {
        return status;
    }

    @JsonProperty("status")
    public void setStatus(String status) {
        this.status = status;
    }

    public ICIPModels withStatus(String status) {
        this.status = status;
        return this;
    }

    @JsonProperty("modelType")
    public String getModelType() {
        return modelType;
    }

    @JsonProperty("modelType")
    public void setModelType(String modelType) {
        this.modelType = modelType;
    }

    public ICIPModels withModelType(String modelType) {
        this.modelType = modelType;
        return this;
    }

    @JsonProperty("framework")
    public String getFramework() {
        return framework;
    }

    @JsonProperty("framework")
    public void setFramework(String framework) {
        this.framework = framework;
    }

    public ICIPModels withFramework(String framework) {
        this.framework = framework;
        return this;
    }

    @JsonProperty("modelFrameworkVersion")
    public String getModelFrameworkVersion() {
        return modelFrameworkVersion;
    }

    @JsonProperty("modelFrameworkVersion")
    public void setModelFrameworkVersion(String modelFrameworkVersion) {
        this.modelFrameworkVersion = modelFrameworkVersion;
    }

    public ICIPModels withModelFrameworkVersion(String modelFrameworkVersion) {
        this.modelFrameworkVersion = modelFrameworkVersion;
        return this;
    }

    @JsonProperty("modelArchitecture")
    public String getModelArchitecture() {
        return modelArchitecture;
    }

    @JsonProperty("modelArchitecture")
    public void setModelArchitecture(String modelArchitecture) {
        this.modelArchitecture = modelArchitecture;
    }

    public ICIPModels withModelArchitecture(String modelArchitecture) {
        this.modelArchitecture = modelArchitecture;
        return this;
    }

    @JsonProperty("inputMode")
    public String getInputMode() {
        return inputMode;
    }

    @JsonProperty("inputMode")
    public void setInputMode(String inputMode) {
        this.inputMode = inputMode;
    }

    public ICIPModels withInputMode(String inputMode) {
        this.inputMode = inputMode;
        return this;
    }

    @JsonProperty("modelDir")
    public String getModelDir() {
        return modelDir;
    }

    @JsonProperty("modelDir")
    public void setModelDir(String modelDir) {
        this.modelDir = modelDir;
    }

    public ICIPModels withModelDir(String modelDir) {
        this.modelDir = modelDir;
        return this;
    }

    @JsonProperty("pushToCodestore")
    public Boolean getPushToCodestore() {
        return pushToCodestore;
    }

    @JsonProperty("pushToCodestore")
    public void setPushToCodestore(Boolean pushToCodestore) {
        this.pushToCodestore = pushToCodestore;
    }

    public ICIPModels withPushToCodestore(Boolean pushToCodestore) {
        this.pushToCodestore = pushToCodestore;
        return this;
    }

    @JsonProperty("metadata")
    public Metadata getMetadata() {
        return metadata;
    }

    @JsonProperty("metadata")
    public void setMetadata(Metadata metadata) {
        this.metadata = metadata;
    }

    public ICIPModels withMetadata(Metadata metadata) {
        this.metadata = metadata;
        return this;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

    public ICIPModels withAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
        return this;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(ICIPModels.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("createdBy");
        sb.append('=');
        sb.append(((this.createdBy == null)?"<null>":this.createdBy));
        sb.append(',');
        sb.append("updatedBy");
        sb.append('=');
        sb.append(((this.updatedBy == null)?"<null>":this.updatedBy));
        sb.append(',');
        sb.append("createdOn");
        sb.append('=');
        sb.append(((this.createdOn == null)?"<null>":this.createdOn));
        sb.append(',');
        sb.append("modifiedOn");
        sb.append('=');
        sb.append(((this.modifiedOn == null)?"<null>":this.modifiedOn));
        sb.append(',');
        sb.append("isDeleted");
        sb.append('=');
        sb.append(((this.isDeleted == null)?"<null>":this.isDeleted));
        sb.append(',');
        sb.append("projectId");
        sb.append('=');
        sb.append(((this.projectId == null)?"<null>":this.projectId));
        sb.append(',');
        sb.append("pipelineId");
        sb.append('=');
        sb.append(((this.pipelineId == null)?"<null>":this.pipelineId));
        sb.append(',');
        sb.append("trialId");
        sb.append('=');
        sb.append(((this.trialId == null)?"<null>":this.trialId));
        sb.append(',');
        sb.append("name");
        sb.append('=');
        sb.append(((this.name == null)?"<null>":this.name));
        sb.append(',');
        sb.append("version");
        sb.append('=');
        sb.append(((this.version == null)?"<null>":this.version));
        sb.append(',');
        sb.append("description");
        sb.append('=');
        sb.append(((this.description == null)?"<null>":this.description));
        sb.append(',');
        sb.append("status");
        sb.append('=');
        sb.append(((this.status == null)?"<null>":this.status));
        sb.append(',');
        sb.append("modelType");
        sb.append('=');
        sb.append(((this.modelType == null)?"<null>":this.modelType));
        sb.append(',');
        sb.append("framework");
        sb.append('=');
        sb.append(((this.framework == null)?"<null>":this.framework));
        sb.append(',');
        sb.append("modelFrameworkVersion");
        sb.append('=');
        sb.append(((this.modelFrameworkVersion == null)?"<null>":this.modelFrameworkVersion));
        sb.append(',');
        sb.append("modelArchitecture");
        sb.append('=');
        sb.append(((this.modelArchitecture == null)?"<null>":this.modelArchitecture));
        sb.append(',');
        sb.append("inputMode");
        sb.append('=');
        sb.append(((this.inputMode == null)?"<null>":this.inputMode));
        sb.append(',');
        sb.append("modelDir");
        sb.append('=');
        sb.append(((this.modelDir == null)?"<null>":this.modelDir));
        sb.append(',');
        sb.append("pushToCodestore");
        sb.append('=');
        sb.append(((this.pushToCodestore == null)?"<null>":this.pushToCodestore));
        sb.append(',');
        sb.append("metadata");
        sb.append('=');
        sb.append(((this.metadata == null)?"<null>":this.metadata));
        sb.append(',');
        sb.append("additionalProperties");
        sb.append('=');
        sb.append(((this.additionalProperties == null)?"<null>":this.additionalProperties));
        sb.append(',');
        if (sb.charAt((sb.length()- 1)) == ',') {
            sb.setCharAt((sb.length()- 1), ']');
        } else {
            sb.append(']');
        }
        return sb.toString();
    }

    @Override
    public int hashCode() {
        int result = 1;
        result = ((result* 31)+((this.trialId == null)? 0 :this.trialId.hashCode()));
        result = ((result* 31)+((this.metadata == null)? 0 :this.metadata.hashCode()));
        result = ((result* 31)+((this.updatedBy == null)? 0 :this.updatedBy.hashCode()));
        result = ((result* 31)+((this.description == null)? 0 :this.description.hashCode()));
        result = ((result* 31)+((this.modelType == null)? 0 :this.modelType.hashCode()));
        result = ((result* 31)+((this.createdOn == null)? 0 :this.createdOn.hashCode()));
        result = ((result* 31)+((this.version == null)? 0 :this.version.hashCode()));
        result = ((result* 31)+((this.pipelineId == null)? 0 :this.pipelineId.hashCode()));
        result = ((result* 31)+((this.modifiedOn == null)? 0 :this.modifiedOn.hashCode()));
        result = ((result* 31)+((this.framework == null)? 0 :this.framework.hashCode()));
        result = ((result* 31)+((this.isDeleted == null)? 0 :this.isDeleted.hashCode()));
        result = ((result* 31)+((this.createdBy == null)? 0 :this.createdBy.hashCode()));
        result = ((result* 31)+((this.inputMode == null)? 0 :this.inputMode.hashCode()));
        result = ((result* 31)+((this.name == null)? 0 :this.name.hashCode()));
        result = ((result* 31)+((this.modelArchitecture == null)? 0 :this.modelArchitecture.hashCode()));
        result = ((result* 31)+((this.pushToCodestore == null)? 0 :this.pushToCodestore.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.modelFrameworkVersion == null)? 0 :this.modelFrameworkVersion.hashCode()));
        result = ((result* 31)+((this.projectId == null)? 0 :this.projectId.hashCode()));
        result = ((result* 31)+((this.modelDir == null)? 0 :this.modelDir.hashCode()));
        result = ((result* 31)+((this.status == null)? 0 :this.status.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof ICIPModels) == false) {
            return false;
        }
        ICIPModels rhs = ((ICIPModels) other);
        return ((((((((((((((((((((((this.trialId == rhs.trialId)||((this.trialId!= null)&&this.trialId.equals(rhs.trialId)))&&((this.metadata == rhs.metadata)||((this.metadata!= null)&&this.metadata.equals(rhs.metadata))))&&((this.updatedBy == rhs.updatedBy)||((this.updatedBy!= null)&&this.updatedBy.equals(rhs.updatedBy))))&&((this.description == rhs.description)||((this.description!= null)&&this.description.equals(rhs.description))))&&((this.modelType == rhs.modelType)||((this.modelType!= null)&&this.modelType.equals(rhs.modelType))))&&((this.createdOn == rhs.createdOn)||((this.createdOn!= null)&&this.createdOn.equals(rhs.createdOn))))&&((this.version == rhs.version)||((this.version!= null)&&this.version.equals(rhs.version))))&&((this.pipelineId == rhs.pipelineId)||((this.pipelineId!= null)&&this.pipelineId.equals(rhs.pipelineId))))&&((this.modifiedOn == rhs.modifiedOn)||((this.modifiedOn!= null)&&this.modifiedOn.equals(rhs.modifiedOn))))&&((this.framework == rhs.framework)||((this.framework!= null)&&this.framework.equals(rhs.framework))))&&((this.isDeleted == rhs.isDeleted)||((this.isDeleted!= null)&&this.isDeleted.equals(rhs.isDeleted))))&&((this.createdBy == rhs.createdBy)||((this.createdBy!= null)&&this.createdBy.equals(rhs.createdBy))))&&((this.inputMode == rhs.inputMode)||((this.inputMode!= null)&&this.inputMode.equals(rhs.inputMode))))&&((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name))))&&((this.modelArchitecture == rhs.modelArchitecture)||((this.modelArchitecture!= null)&&this.modelArchitecture.equals(rhs.modelArchitecture))))&&((this.pushToCodestore == rhs.pushToCodestore)||((this.pushToCodestore!= null)&&this.pushToCodestore.equals(rhs.pushToCodestore))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.modelFrameworkVersion == rhs.modelFrameworkVersion)||((this.modelFrameworkVersion!= null)&&this.modelFrameworkVersion.equals(rhs.modelFrameworkVersion))))&&((this.projectId == rhs.projectId)||((this.projectId!= null)&&this.projectId.equals(rhs.projectId))))&&((this.modelDir == rhs.modelDir)||((this.modelDir!= null)&&this.modelDir.equals(rhs.modelDir))))&&((this.status == rhs.status)||((this.status!= null)&&this.status.equals(rhs.status))));
    }

}
