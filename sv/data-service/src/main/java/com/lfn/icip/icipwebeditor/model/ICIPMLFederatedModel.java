package com.lfn.icip.icipwebeditor.model;
import java.sql.Timestamp;

import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@DynamicInsert
@DynamicUpdate
@Entity
@EntityListeners(AuditListener.class)
@Table(name = "mlfederatedmodels")
@Data
@Getter
@Setter
@NoArgsConstructor
public class ICIPMLFederatedModel {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "model_name")
	private String modelName;
	
	private String description;
	
	private String version;
	
	@Column(name = "data_source")
	private String datasource;
	
	private String attributes;
	
	private String organisation;
	
	@Column(name = "model_type")
	private String modelType;
	
	
    @Column(name = "created_on", unique = false, nullable = false, insertable = true, updatable = false)
	Timestamp createdOn;
    @Column(name="created_by")
    
	String createdBy;
    @Column(name="app_modified_date")
    
	Timestamp modifiedDate;
    
    @Column(name="app_modified_by")
	String modifiedBy;
    
    
	
}
