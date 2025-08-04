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

package com.infosys.icets.icip.dataset.model.dto;

import java.io.Serializable;

import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
//TODO: Auto-generated Javadoc
/**
* Gets the last modified date.
*
* @return the last modified date
*/

/**
* Gets the organization.
*
* @return the organization
*/

/**
 * Gets the schema B.
 *
 * @return the schema B
 */
@Getter

/**
 * Sets the last modified date.
 *
 * @param lastModifiedDate the new last modified date
 */

/**
 * Sets the organization.
 *
 * @param organization the new organization
 */

/**
 * Sets the schema B.
 *
 * @param schemaB the new schema B
 */
@Setter

/**
 * Instantiates a new ICIP relationship DTO.
 */

/**
 * Instantiates a new ICIP relationship DTO.
 */
@NoArgsConstructor
public class ICIPRelationshipDTO extends BaseDomain implements Serializable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	/** The id. */
	private Integer id;
	
	/** The relationship name. */
	private String name;
	
	/** The organization. */
	private String organization;
	
	/** The relationship json. */
	private String schema_relation;

	/** The relationship template. */
	private String relationship_template;
	
	/** The schemaA. */
	private String schemaA;
	
	/** The schemaB. */
	private String schemaB;
}

