/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

package com.lfn.icip.dataset.model.dto;

import java.io.Serializable;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import com.lfn.ai.comm.lib.util.domain.BaseDomain;
import com.lfn.icip.dataset.model.ICIPDatasource;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPSchemaRegistryDTO.
 *
 * @author essedum
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
 @EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class ICIPSchemaRegistryDTO extends BaseDomain implements Serializable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;
	
	/** The name. */
	private String name;
	
	/** The description. */
	private String description;
	
	/** The schemavalue. */
	private String schemavalue;
	
	/** The organization. */
	private String organization;
	
	/** The formtemplate. */
	private String formtemplate;
	
	/** The type. */
	private String type;
	
	/** The capability. */
	private String capability;
}
