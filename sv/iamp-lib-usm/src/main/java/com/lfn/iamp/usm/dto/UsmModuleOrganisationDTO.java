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

import java.sql.Date;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A UsmModuleOrganisationDTO.
 */
/**
* @author essedum
*/

/**
 * Sets the organisation.
 *
 * @param organisation the new organisation
 */

/**
 * Sets the subscription.
 *
 * @param subscription the new subscription
 */

/**
 * Sets the subscription.
 *
 * @param subscription the new subscription
 */
@Setter

/**
 * Gets the organisation.
 *
 * @return the organisation
 */

/**
 * Gets the subscription.
 *
 * @return the subscription
 */

/**
 * Gets the subscription.
 *
 * @return the subscription
 */
@Getter

/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
public class UsmModuleOrganisationDTO {
	
	/** The id. */
	private Integer id;
	
	/** The module. */
	private UsmModuleDTO module;
	
	/** The startdate. */
	private Date startdate;
	
	/** The enddate. */
	private Date enddate;
	
	/** The subscriptionstatus. */
	private Boolean subscriptionstatus;
	
	/** The organisation. */
	private ProjectDTO organisation;
	
	/** The subscription. */
	private String subscription;
	
	

}
