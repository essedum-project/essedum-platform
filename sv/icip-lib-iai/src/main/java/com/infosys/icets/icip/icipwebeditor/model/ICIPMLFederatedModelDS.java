package com.infosys.icets.icip.icipwebeditor.model;

import java.sql.Timestamp;

import org.hibernate.annotations.Cascade;

import com.infosys.icets.icip.dataset.model.ICIPDatasource;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity@Table(name = "mlfederatedmodels")
@Data
@Getter
@Setter
@NoArgsConstructor
public class ICIPMLFederatedModelDS {
		
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(name = "model_name")
	private String modelName;
	
	private String description;
	
	private String version;
	
	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "data_source", referencedColumnName = "name")
	@JoinColumn(updatable = false, insertable = false, name = "organisation", referencedColumnName = "organization")
	@Cascade(value = org.hibernate.annotations.CascadeType.SAVE_UPDATE)
	private ICIPDatasource datasource;
	
	private String attributes;
	
	private String organisation;
	
	@Column(name="model_type")
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
