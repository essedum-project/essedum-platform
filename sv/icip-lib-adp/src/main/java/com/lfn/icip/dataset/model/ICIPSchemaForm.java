package com.lfn.icip.dataset.model;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


import org.hibernate.annotations.Cascade;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlschemaformtemplates", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "organization" ,"schemaname"}))
public class ICIPSchemaForm implements Serializable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The name. */
	private String name;
	
	/** The alias. */
	private String alias;
	
	/** The organization. */
	private String organization;

	private String schemaname;

	/** The formtemplate. */
	private String formtemplate;

}
