/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.dataset.model.dto;

import java.io.Serializable;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;
import com.infosys.icets.icip.dataset.model.ICIPDatasource;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPSchemaRegistryDTO.
 *
 * @author icets
 */

/**
 * Gets the organization.
 *
 * @return the organization
 */

/**
 * Gets the formtemplate.
 *
 * @return the formtemplate
 */

/**
 * Gets the formtemplate.
 *
 * @return the formtemplate
 */
@Getter 
 /**
  * Sets the organization.
  *
  * @param organization the new organization
  */
 
 /**
  * Sets the formtemplate.
  *
  * @param formtemplate the new formtemplate
  */
 
 /**
  * Sets the formtemplate.
  *
  * @param formtemplate the new formtemplate
  */
 @Setter 
 /**
  * Instantiates a new ICIP schema registry DTO.
  */
 
 /**
  * Instantiates a new ICIP schema registry DTO.
  */
 
 /**
  * Instantiates a new ICIP schema registry DTO.
  */
 @NoArgsConstructor
public class ICIPSchemaFormDTO implements Serializable {
	
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
