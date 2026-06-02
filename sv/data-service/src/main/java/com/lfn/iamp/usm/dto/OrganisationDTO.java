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
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;


// TODO: Auto-generated Javadoc
/**
 * The Class OrganisationDTO.
 *
 * @author essedum
 */

/**
 * Gets the context.
 *
 * @return the context
 */

/**
 * Gets the context.
 *
 * @return the context
 */
@Getter

/**
 * Sets the context.
 *
 * @param context the new context
 */

/**
 * Sets the context.
 *
 * @param context the new context
 */
@Setter
public class OrganisationDTO implements Serializable {
	
	/** The id. */
	private Integer id;

	/** The name. */
	private String name;


	/** The location. */
	private String location;


	/** The division. */
	private String division;


	/** The country. */
	private String country;


	/** The decription. */
	private String decription;

	/** The onboarded. */
	private Boolean onboarded;

	/** The status. */
	private String status;

	/** The createdby. */
	private String createdby;

	/** The createddate. */
	private LocalDate createddate;


	/** The modifiedby. */
	private String modifiedby;


	/** The modifieddate. */
	private LocalDate modifieddate;


	/** The context. */
	private ContextDTO context;

	

	
}
