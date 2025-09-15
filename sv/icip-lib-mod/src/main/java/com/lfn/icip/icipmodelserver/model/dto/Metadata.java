
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
    "techniques",
    "scope",
    "publisher",
    "licenseType",
    "inputDataType",
    "sampleReqResp",
    "readMe",
    "hasInference",
    "downloadLink",
    "businessUsecase",
    "tryoutLink",
    "keywords"
})

@Generated("jsonschema2pojo")
public class Metadata {

    @JsonProperty("techniques")
    private String techniques;
    @JsonProperty("scope")
    private String scope;
    @JsonProperty("publisher")
    private String publisher;
    @JsonProperty("licenseType")
    private String licenseType;
    @JsonProperty("inputDataType")
    private String inputDataType;
    @JsonProperty("sampleReqResp")
    private Object sampleReqResp;
    @JsonProperty("readMe")
    private String readMe;
    @JsonProperty("hasInference")
    private Boolean hasInference;
    @JsonProperty("downloadLink")
    private String downloadLink;
    @JsonProperty("businessUsecase")
    private String businessUsecase;
    @JsonProperty("tryoutLink")
    private Object tryoutLink;
    @JsonProperty("keywords")
    private String keywords;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("techniques")
    public String getTechniques() {
        return techniques;
    }

    @JsonProperty("techniques")
    public void setTechniques(String techniques) {
        this.techniques = techniques;
    }

    public Metadata withTechniques(String techniques) {
        this.techniques = techniques;
        return this;
    }

    @JsonProperty("scope")
    public String getScope() {
        return scope;
    }

    @JsonProperty("scope")
    public void setScope(String scope) {
        this.scope = scope;
    }

    public Metadata withScope(String scope) {
        this.scope = scope;
        return this;
    }

    @JsonProperty("publisher")
    public String getPublisher() {
        return publisher;
    }

    @JsonProperty("publisher")
    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public Metadata withPublisher(String publisher) {
        this.publisher = publisher;
        return this;
    }

    @JsonProperty("licenseType")
    public String getLicenseType() {
        return licenseType;
    }

    @JsonProperty("licenseType")
    public void setLicenseType(String licenseType) {
        this.licenseType = licenseType;
    }

    public Metadata withLicenseType(String licenseType) {
        this.licenseType = licenseType;
        return this;
    }

    @JsonProperty("inputDataType")
    public String getInputDataType() {
        return inputDataType;
    }

    @JsonProperty("inputDataType")
    public void setInputDataType(String inputDataType) {
        this.inputDataType = inputDataType;
    }

    public Metadata withInputDataType(String inputDataType) {
        this.inputDataType = inputDataType;
        return this;
    }

    @JsonProperty("sampleReqResp")
    public Object getSampleReqResp() {
        return sampleReqResp;
    }

    @JsonProperty("sampleReqResp")
    public void setSampleReqResp(Object sampleReqResp) {
        this.sampleReqResp = sampleReqResp;
    }

    public Metadata withSampleReqResp(Object sampleReqResp) {
        this.sampleReqResp = sampleReqResp;
        return this;
    }

    @JsonProperty("readMe")
    public String getReadMe() {
        return readMe;
    }

    @JsonProperty("readMe")
    public void setReadMe(String readMe) {
        this.readMe = readMe;
    }

    public Metadata withReadMe(String readMe) {
        this.readMe = readMe;
        return this;
    }

    @JsonProperty("hasInference")
    public Boolean getHasInference() {
        return hasInference;
    }

    @JsonProperty("hasInference")
    public void setHasInference(Boolean hasInference) {
        this.hasInference = hasInference;
    }

    public Metadata withHasInference(Boolean hasInference) {
        this.hasInference = hasInference;
        return this;
    }

    @JsonProperty("downloadLink")
    public String getDownloadLink() {
        return downloadLink;
    }

    @JsonProperty("downloadLink")
    public void setDownloadLink(String downloadLink) {
        this.downloadLink = downloadLink;
    }

    public Metadata withDownloadLink(String downloadLink) {
        this.downloadLink = downloadLink;
        return this;
    }

    @JsonProperty("businessUsecase")
    public String getBusinessUsecase() {
        return businessUsecase;
    }

    @JsonProperty("businessUsecase")
    public void setBusinessUsecase(String businessUsecase) {
        this.businessUsecase = businessUsecase;
    }

    public Metadata withBusinessUsecase(String businessUsecase) {
        this.businessUsecase = businessUsecase;
        return this;
    }

    @JsonProperty("tryoutLink")
    public Object getTryoutLink() {
        return tryoutLink;
    }

    @JsonProperty("tryoutLink")
    public void setTryoutLink(Object tryoutLink) {
        this.tryoutLink = tryoutLink;
    }

    public Metadata withTryoutLink(Object tryoutLink) {
        this.tryoutLink = tryoutLink;
        return this;
    }

    @JsonProperty("keywords")
    public String getKeywords() {
        return keywords;
    }

    @JsonProperty("keywords")
    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public Metadata withKeywords(String keywords) {
        this.keywords = keywords;
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

    public Metadata withAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
        return this;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Metadata.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("techniques");
        sb.append('=');
        sb.append(((this.techniques == null)?"<null>":this.techniques));
        sb.append(',');
        sb.append("scope");
        sb.append('=');
        sb.append(((this.scope == null)?"<null>":this.scope));
        sb.append(',');
        sb.append("publisher");
        sb.append('=');
        sb.append(((this.publisher == null)?"<null>":this.publisher));
        sb.append(',');
        sb.append("licenseType");
        sb.append('=');
        sb.append(((this.licenseType == null)?"<null>":this.licenseType));
        sb.append(',');
        sb.append("inputDataType");
        sb.append('=');
        sb.append(((this.inputDataType == null)?"<null>":this.inputDataType));
        sb.append(',');
        sb.append("sampleReqResp");
        sb.append('=');
        sb.append(((this.sampleReqResp == null)?"<null>":this.sampleReqResp));
        sb.append(',');
        sb.append("readMe");
        sb.append('=');
        sb.append(((this.readMe == null)?"<null>":this.readMe));
        sb.append(',');
        sb.append("hasInference");
        sb.append('=');
        sb.append(((this.hasInference == null)?"<null>":this.hasInference));
        sb.append(',');
        sb.append("downloadLink");
        sb.append('=');
        sb.append(((this.downloadLink == null)?"<null>":this.downloadLink));
        sb.append(',');
        sb.append("businessUsecase");
        sb.append('=');
        sb.append(((this.businessUsecase == null)?"<null>":this.businessUsecase));
        sb.append(',');
        sb.append("tryoutLink");
        sb.append('=');
        sb.append(((this.tryoutLink == null)?"<null>":this.tryoutLink));
        sb.append(',');
        sb.append("keywords");
        sb.append('=');
        sb.append(((this.keywords == null)?"<null>":this.keywords));
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
        result = ((result* 31)+((this.keywords == null)? 0 :this.keywords.hashCode()));
        result = ((result* 31)+((this.readMe == null)? 0 :this.readMe.hashCode()));
        result = ((result* 31)+((this.licenseType == null)? 0 :this.licenseType.hashCode()));
        result = ((result* 31)+((this.businessUsecase == null)? 0 :this.businessUsecase.hashCode()));
        result = ((result* 31)+((this.downloadLink == null)? 0 :this.downloadLink.hashCode()));
        result = ((result* 31)+((this.techniques == null)? 0 :this.techniques.hashCode()));
        result = ((result* 31)+((this.scope == null)? 0 :this.scope.hashCode()));
        result = ((result* 31)+((this.publisher == null)? 0 :this.publisher.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.tryoutLink == null)? 0 :this.tryoutLink.hashCode()));
        result = ((result* 31)+((this.sampleReqResp == null)? 0 :this.sampleReqResp.hashCode()));
        result = ((result* 31)+((this.inputDataType == null)? 0 :this.inputDataType.hashCode()));
        result = ((result* 31)+((this.hasInference == null)? 0 :this.hasInference.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Metadata) == false) {
            return false;
        }
        Metadata rhs = ((Metadata) other);
        return ((((((((((((((this.keywords == rhs.keywords)||((this.keywords!= null)&&this.keywords.equals(rhs.keywords)))&&((this.readMe == rhs.readMe)||((this.readMe!= null)&&this.readMe.equals(rhs.readMe))))&&((this.licenseType == rhs.licenseType)||((this.licenseType!= null)&&this.licenseType.equals(rhs.licenseType))))&&((this.businessUsecase == rhs.businessUsecase)||((this.businessUsecase!= null)&&this.businessUsecase.equals(rhs.businessUsecase))))&&((this.downloadLink == rhs.downloadLink)||((this.downloadLink!= null)&&this.downloadLink.equals(rhs.downloadLink))))&&((this.techniques == rhs.techniques)||((this.techniques!= null)&&this.techniques.equals(rhs.techniques))))&&((this.scope == rhs.scope)||((this.scope!= null)&&this.scope.equals(rhs.scope))))&&((this.publisher == rhs.publisher)||((this.publisher!= null)&&this.publisher.equals(rhs.publisher))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.tryoutLink == rhs.tryoutLink)||((this.tryoutLink!= null)&&this.tryoutLink.equals(rhs.tryoutLink))))&&((this.sampleReqResp == rhs.sampleReqResp)||((this.sampleReqResp!= null)&&this.sampleReqResp.equals(rhs.sampleReqResp))))&&((this.inputDataType == rhs.inputDataType)||((this.inputDataType!= null)&&this.inputDataType.equals(rhs.inputDataType))))&&((this.hasInference == rhs.hasInference)||((this.hasInference!= null)&&this.hasInference.equals(rhs.hasInference))));
    }

}
