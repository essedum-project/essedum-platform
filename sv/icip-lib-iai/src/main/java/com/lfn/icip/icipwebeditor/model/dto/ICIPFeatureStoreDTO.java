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

public class ICIPFeatureStoreDTO {
	
	Integer id;
	String storeName;
	String registrytype;
	String projectname;
	String onlinedatacloud;
	String onlinedataclouddatabase;
	String projectdescr;
	String scheduler;
	String registrydbpath;
	String implementationlibrary;
	String provider;
	String keymanagementhost;
	String rawPayload;
//	Map<String, String> additionalProperties = new HashMap<String, String>();
//	
//	public Map<String, String> getAdditionalProperties() {
//        return this.additionalProperties;
//    }
//    public void setAdditionalProperties(String name, String value) {
//        this.additionalProperties.put(name, value);
//    }

}
