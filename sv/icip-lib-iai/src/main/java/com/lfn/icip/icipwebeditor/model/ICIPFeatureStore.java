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
@Table(name = "mlfeaturestore")
@Data
public class ICIPFeatureStore {
	@EmbeddedId
	FedFeatureStore featureStoreId;
	//@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id", unique = true, nullable = false, insertable = false, updatable = false)
	Integer id;
	@Column(name = "app_name")
	String name;
	@Column(name = "fed_org")
	String sourceOrg;
	@Column(name = "adapter_alias")
	String adapter;
	@Column(name = "created_by")
	String createdBy;
	@Column(name = "created_on")
	Timestamp createdOn;
	@Column(name = "modified_on")
	Timestamp modifiedOn;
	@Column(name = "sync_date")
	Timestamp syncDate;
	@Column(name = "project_description")
	String description;
	@Column(name = "imp_library")
	String implementationlibrary;
	@Column(name = "scheduler")
	String scheduler;
	@Column(name = "provider")
	String provider;
	@Column(name = "keymanagement_host")
	String keymanagementHost;
	@Column(name = "online_datacloud")
	String onlineDatacloud;
	@Column(name = "odc_database")
	String onDCDatabase;
	@Column(name = "registry_type")
	String registryType;
	@Column(name = "registry_dbpath")
	String registrydbpath;
	@Column(name = "additional_properties")
	String additionalProperties;
	@Column(name = "raw_payload")
	String rawPayload;
	@Column(name = "features")
	String features;
	@Column(name = "is_deleted")
	Boolean isDeleted;
}
