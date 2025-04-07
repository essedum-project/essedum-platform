/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.dto;

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
 * @author icets
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