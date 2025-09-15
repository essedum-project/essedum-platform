package com.lfn.icip.dataset.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import org.hibernate.annotations.Cascade;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mldatasetformmapping")
public class ICIPDatasetFormMapping {
	
	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;
	
	/** The organization. */
	private String organization;

	private String dataset;

	/** The formtemplate. */
	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "formtemplate", referencedColumnName = "name")
	@JoinColumn(updatable = false, insertable = false, name = "organization", referencedColumnName = "organization")
	@Cascade(value = org.hibernate.annotations.CascadeType.SAVE_UPDATE)
	private ICIPSchemaForm formtemplate;
	

}
