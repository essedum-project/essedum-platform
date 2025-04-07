
package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Generated("jsonschema2pojo")
public class Data {

    @JsonProperty("models")
    private List<Model> models = new ArrayList<Model>();
    @JsonProperty("endpoints")
    private List<Endpoint> endpoints = new ArrayList<Endpoint>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();
 
    

    @JsonProperty("models")
    public List<Model> getModels() {
        return models;
    }
    
    @JsonProperty("endpoints")
    public List<Endpoint> getEndpoints() {
        return endpoints;
    }
    
    @JsonProperty("models")
    public void setModels(List<Model> models) {
        this.models = models;
    }
    @JsonProperty("endpoints")
    public void setEndpoints(List<Endpoint> endpoints) {
        this.endpoints = endpoints;
    }

    public Data withModels(List<Model> models) {
        this.models = models;
        return this;
    }

    public Data withEndpoints(List<Endpoint> endpoints) {
        this.endpoints =endpoints;
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

    public Data withAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
        return this;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Data.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("models");
        sb.append('=');
        sb.append(((this.models == null)?"<null>":this.models));
        sb.append(',');
        sb.append("additionalProperties");
        sb.append('=');
        sb.append(((this.additionalProperties == null)?"<null>":this.additionalProperties));
        sb.append(',');
        sb.append("endpoints");
        sb.append('=');
        sb.append(((this.endpoints == null)?"<null>":this.endpoints));
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
        result = ((result* 31)+((this.models == null)? 0 :this.models.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.endpoints == null)? 0 :this.endpoints.hashCode()));

        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Data) == false) {
            return false;
        }
        Data rhs = ((Data) other);
        return (((this.models == rhs.models)||((this.models!= null)&&this.models.equals(rhs.models)))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties)))&&((this.endpoints == rhs.endpoints)||((this.endpoints!= null)&&this.endpoints.equals(rhs.endpoints))));
    }

}
