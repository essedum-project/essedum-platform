package com.lfn.icip.icipwebeditor.model.dto;

import java.sql.Timestamp;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.lfn.icip.icipwebeditor.model.FedEndpointID;

import groovy.transform.EqualsAndHashCode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ICIPMLFederatedEndpointDTO {
	Integer id;
//	String fedId;
	String sourceId;
	String adapterId;
//	String appName;
	String name;
//	String fedName;
	String sourceName;
//	String fedOrg;
	String sourceOrg;
//	String appOrg;
	String organisation;
//    String status;
	String sourceStatus;
    String deployedModels;
//    String adapterAlias;
    String adapter;
    String createdBy;
    @DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp createdOn;
	Boolean isDeleted;
//	String fedModifiedBy;
	String sourceModifiedBy;
//	String appModifiedBy;
	String modifiedBy;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
//	Timestamp appModifiedDate;
	Timestamp modifiedDate;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
//	Timestamp fedModifiedDate;
	Timestamp sourceModifiedDate;
	@DateTimeFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
    @JsonFormat(pattern = "Yyyy-mm-dd HH:mm:ss")
	Timestamp syncDate;
//	String endpointType;
	String type;
//	Integer endpointLikes;
	Integer likes;
//	String endpointMetadata;
	String metadata;
	String rawPayload;
	String contextUri;
//	String appApplication;
	String application;
//	String appSample;
	String sample;
//	String appStatus;
	String status;
//	String appDescription;
	String description;
	
	String restProvider;
	
	String swaggerData;
}
