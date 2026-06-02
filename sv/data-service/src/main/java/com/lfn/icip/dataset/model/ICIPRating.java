package com.lfn.icip.dataset.model;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlrating")
public class ICIPRating {
	
	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;
	
	/** The module. */
	private String module;
	
	/** The element. */
	private String element;
	
	/** The element. */
	private String elementAlias;
	
	/** The organization. */
	private String organization;

	/** The user. */
	private Integer user;

	/** The rating. */
	private Integer rating;
	
	/** The feedback. */
	private String feedback;

}
