package com.lfn.icip.icipwebeditor.model.dto;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.Null;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonFormat;
import groovy.transform.EqualsAndHashCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode

public class ICIPFeaturesDTO {
	
	Integer id;
	String featureName;
	String entities;
	String featureKey;
	String timestampField;
	String featureDatatype;
	String description;
	String tags;
	String owner;
	String projectionName;
	String desiredFeatures;
	String joinKeyMap;
	String online;
	String materializationIntervals;
	String featureGroup;
	String sourceTable;
	String lastRefreshTime;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp createdOn;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp lastUpdated;
	String rawPayload;
	
	Map<String, String> additionalProperties = new HashMap<String, String>();
	
	public Map<String, String> getAdditionalProperties() {
        return this.additionalProperties;
    }
    public void setAdditionalProperties(String name, String value) {
        this.additionalProperties.put(name, value);
    }
}
