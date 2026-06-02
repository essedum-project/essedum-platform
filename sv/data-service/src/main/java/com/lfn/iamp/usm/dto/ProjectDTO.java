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
import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.Date;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class ProjectDTO.
 *
 * @author essedum
 */

/**
 * Gets the portfolio id.
 *
 * @return the portfolio id
 */

/**
 * Gets the theme.
 *
 * @return the theme
 */

/**
 * Gets the product details.
 *
 * @return the product details
 */

/**
 * Gets the product details.
 *
 * @return the product details
 */

/**
 * Gets the azure org id.
 *
 * @return the azure org id
 */
@Getter

/**
 * Sets the portfolio id.
 *
 * @param portfolioId the new portfolio id
 */

/**
 * Sets the theme.
 *
 * @param theme the new theme
 */

/**
 * Sets the product details.
 *
 * @param productDetails the new product details
 */

/**
 * Sets the product details.
 *
 * @param productDetails the new product details
 */

/**
 * Sets the azure org id.
 *
 * @param azureOrgId the new azure org id
 */
@Setter
public class ProjectDTO implements Serializable {

	/** The id. */
	private Integer id;

	/** The name. */
	private String name;

	/** The description. */
	private String description;

	/** The last updated. */
	private ZonedDateTime lastUpdated;
	
	/** The logo name. */
	private String logoName;
	
	/** The logo. */
	private byte[] logo;    
	
	/** The defaultrole. */
	private Boolean defaultrole;
	
	/** The portfolio id. */
	private UsmPortfolioDTO portfolioId;
	
	/** The projectdisplayname. */
	private String 	projectdisplayname;
	
	/** The theme. */
	private String theme;
	
	/** The domain name. */
	private String domainName;
	
	/** The product details. */
	private String productDetails;

	/** The time zone. */
	private String timeZone;
	
	/** The azure org id. */
	private String azureOrgId;
	
	 /** The provisioneddate. */
    private Date provisioneddate;
    
    /** Disable Excel? */
	private Boolean disableExcel;
	
	/** Created Date */
	private Timestamp createdDate;
	
	private Boolean projectAutologin;
	
	private RoleDTO autologinRole;

	private Boolean autoUserProject;
}