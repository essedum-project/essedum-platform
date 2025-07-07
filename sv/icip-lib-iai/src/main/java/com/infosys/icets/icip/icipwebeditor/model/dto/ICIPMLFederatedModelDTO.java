package com.infosys.icets.icip.icipwebeditor.model.dto;

import java.sql.Timestamp;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.validation.constraints.Null;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.infosys.icets.icip.icipwebeditor.model.FedModelsID;

import groovy.transform.EqualsAndHashCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ICIPMLFederatedModelDTO {
	Integer id;
//	String fedId;
	String sourceId;
	String adapterId;
	@Nullable
//	String appName;
	String name;
//	String fedName;
	String sourceName;
//	String status;
	String sourceStatus;
	String artifacts;
	String container;
	@Nullable
//	String appDescription;
	String description;
//	String fedDescription;
	String sourceDescription;
	String version;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp createdOn;
	String createdBy;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp syncDate;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
//	Timestamp appModifiedDate;
	Timestamp modifiedDate;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
//	Timestamp fedModifiedDate;
	Timestamp sourceModifiedDate;
//	String fedModifiedBy;
	String sourceModifiedBy; 
	@Nullable
//	String appModifiedBy;
	String modifiedBy;
//	String appOrg;
	String organisation;
//	String fedOrg;
	String sourceOrg;
//	String modelType;
	String type;
//	Integer modelLikes;
	Integer likes;
//	String modelMetadata;
	String metadata;
//	String adapterAlias;
	String adapter;
//	String appStatus;
	String status;
//	String modelDeployment;
	String deployment;
	String rawPayload;
}
