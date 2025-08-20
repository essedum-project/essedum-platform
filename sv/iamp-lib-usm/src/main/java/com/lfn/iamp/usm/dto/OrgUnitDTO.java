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

package com.lfn.iamp.usm.dto;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class OrgUnitDTO.
 *
 * @author essedum
 */

/**
 * Gets the organisation.
 *
 * @return the organisation
 */

/**
 * Gets the organisation.
 *
 * @return the organisation
 */
@Getter

/**
 * Sets the organisation.
 *
 * @param organisation the new organisation
 */

/**
 * Sets the organisation.
 *
 * @param organisation the new organisation
 */
@Setter
public class OrgUnitDTO implements Serializable{
	
	/** The id. */
	private Integer id;


	/** The name. */
	private String name;


	/** The description. */
	private String description;


	/** The onboarded. */
	private Boolean onboarded;


	/** The context. */
	private ContextDTO context;


	/** The organisation. */
	private OrganisationDTO organisation;

	

	

}
