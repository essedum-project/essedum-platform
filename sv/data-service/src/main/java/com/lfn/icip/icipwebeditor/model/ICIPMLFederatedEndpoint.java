package com.lfn.icip.icipwebeditor.model;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.Data;

@DynamicInsert
@DynamicUpdate
@Entity
@EntityListeners(AuditListener.class)
@Table(name = "mlfederatedendpoints")
@Data
public class ICIPMLFederatedEndpoint {
	@EmbeddedId
//	FedEndpointID fedEndpointId;
	FedEndpointID SourceEndpointId;
	//@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique = true, nullable = false, insertable = false, updatable = false)
	Integer id;
	@Column(name = "app_name")
//	String appName;
	String name;
	@Column(name = "fed_name")
//	String fedName;
	String sourceName;
	@Column(name = "adapter_alias")
//	String adapterAlias;
	String adapter;
	@Column(name = "fed_org", unique = false, nullable = false, insertable = true, updatable = false)
//	String fedOrg;
//	String status;
	String sourceOrg;
	@Column(name = "status")
	String sourcestatus;
	@Column(name = "deployed_models")
	String deployedModels;
	@Column(name = "raw_payload")
	String rawPayload;
	@Column(name = "created_on", unique = false, nullable = false, insertable = true, updatable = false)
	Timestamp createdOn;
	@Column(name = "created_by")
	String createdBy;
	@Column(name = "sync_date")
	Timestamp syncDate;
	@Column(name = "app_modified_date")
//	Timestamp appModifiedDate;
	Timestamp modifiedDate;
	@Column(name = "fed_modified_date")
//	Timestamp fedModifiedDate;
	Timestamp sourceModifiedDate;
	@Column(name = "fed_modified_by")
//	String fedModifiedBy;
	String sourceModifiedBy;
	@Column(name = "app_modified_by")
//	String appModifiedBy;
	String modifiedBy;
	@Column(name = "is_deleted")
	Boolean isDeleted;
	@Column(name = "endpoint_type")
//	String endpointType;
	String type;
	@Column(name = "endpoint_likes")
//	Integer endpointLikes;
	Integer likes;
	@Column(name = "endpoint_metadata")
//	String endpointMetadata;
	String metadata;
    @Column (name="context_uri")
    String contextUri;
    @Column (name="app_application")
//    String appApplication;
    String application;
    @Column (name="app_sample")
//    String appSample;
    String sample;
    @Column (name="app_status")
//    String appStatus;
    String status;
    @Column (name="app_description")
//    String appDescription;
    String description;
    
    @Column (name="rest_provider")
    String restProvider;
    
    @Column (name="swagger_data")
    String swaggerData;
}
