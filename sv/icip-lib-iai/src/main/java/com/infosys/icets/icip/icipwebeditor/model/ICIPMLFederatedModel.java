package com.infosys.icets.icip.icipwebeditor.model;
import java.sql.Timestamp;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@DynamicInsert
@DynamicUpdate
@Entity
@EntityListeners(AuditListener.class)
@Table(name = "mlfederatedmodels")
@Data
public class ICIPMLFederatedModel {
	@EmbeddedId
//	FedModelsID fedModelId;
	FedModelsID sourceModelId;
//	@GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", unique = true, nullable = false, insertable = false, updatable = false)
	Integer id;
	@Column(name="app_name")
	String name;
	@Column(name="fed_name")
	String sourceName;
	@Column(name="status")
	String sourceStatus;
	@Column(name="raw_payload")
	String rawPayload;
	String artifacts;
	String container;
	@Column(name="app_description")
	String description;
	@Column(name="fed_description")
	String sourceDescription;
	String version;
    @Column(name = "created_on", unique = false, nullable = false, insertable = true, updatable = false)
	Timestamp createdOn;
    @Column(name="created_by")
	String createdBy;
    @Column(name="sync_date")
	Timestamp syncDate;
    @Column(name="app_modified_date")
	Timestamp modifiedDate;
    @Column(name="fed_modified_date")
	Timestamp sourceModifiedDate;
    @Column(name="fed_modified_by")
	String sourceModifiedBy;
    @Column(name="app_modified_by")
	String modifiedBy;

    @Column(name = "fed_org", unique = false, nullable = false, insertable = true, updatable = false)
	String sourceOrg;
    @Column(name="is_deleted")
	Boolean isDeleted;
    @Column(name="model_type")
    String type;
    @Column(name="model_likes")
    Integer likes;
    @Column(name="model_metadata")
    String metadata;
    @Column(name="adapter_alias")
    String adapter;
    @Column(name="app_status")
    String status;
    @Column(name="model_deployment")
    String deployment;

	
    
}
