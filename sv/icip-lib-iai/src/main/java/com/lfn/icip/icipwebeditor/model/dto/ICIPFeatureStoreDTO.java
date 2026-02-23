package com.lfn.icip.icipwebeditor.model.dto;

import java.util.HashMap;
import java.util.Map;


import groovy.transform.EqualsAndHashCode;
import lombok.AllArgsConstructor;
import lombok.Data;
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
