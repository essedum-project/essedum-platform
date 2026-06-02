package com.lfn.icip.dataset.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;


import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlmashups")
public class ICIPMashups {
	
	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;
	
	/** The organization. */
	private String organization;

	private String name;

	/** The template. */
	private String template;
	
	/** The interfacetype. */
	private String interfacetype;

}
