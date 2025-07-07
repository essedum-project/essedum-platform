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
package com.infosys.icets.iamp.usm.domain;

import java.io.Serializable;
import java.sql.Timestamp;
import java.time.ZonedDateTime;
import java.util.Date;
import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * A Project.
 */
/**
 * @author icets
 */
@Entity
@Table(name = "usm_project")

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

/**
 * Instantiates a new project.
 *
 * @param id                 the id
 * @param name               the name
 * @param description        the description
 * @param lastUpdated        the last updated
 * @param logoName           the logo name
 * @param logo               the logo
 * @param defaultrole        the defaultrole
 * @param portfolioId        the portfolio id
 * @param projectdisplayname the projectdisplayname
 * @param theme              the theme
 */

/**
 * Instantiates a new project.
 *
 * @param id                 the id
 * @param name               the name
 * @param description        the description
 * @param lastUpdated        the last updated
 * @param logoName           the logo name
 * @param logo               the logo
 * @param defaultrole        the defaultrole
 * @param portfolioId        the portfolio id
 * @param projectdisplayname the projectdisplayname
 * @param theme              the theme
 * @param domainName         the domain name
 * @param productDetails     the product details
 */

/**
 * Instantiates a new project.
 *
 * @param id                 the id
 * @param name               the name
 * @param description        the description
 * @param lastUpdated        the last updated
 * @param logoName           the logo name
 * @param logo               the logo
 * @param defaultrole        the defaultrole
 * @param portfolioId        the portfolio id
 * @param projectdisplayname the projectdisplayname
 * @param theme              the theme
 * @param domainName         the domain name
 * @param productDetails     the product details
 * @param timeZone           the time zone
 */

/**
 * Instantiates a new project.
 *
 * @param id                 the id
 * @param name               the name
 * @param description        the description
 * @param lastUpdated        the last updated
 * @param logoName           the logo name
 * @param logo               the logo
 * @param defaultrole        the defaultrole
 * @param portfolioId        the portfolio id
 * @param projectdisplayname the projectdisplayname
 * @param theme              the theme
 * @param domainName         the domain name
 * @param productDetails     the product details
 * @param timeZone           the time zone
 * @param azureOrgId         the azure org id
 */
@AllArgsConstructor

/**
 * Instantiates a new project.
 */

/**
 * Instantiates a new project.
 */

/**
 * Instantiates a new project.
 */

/**
 * Instantiates a new project.
 */
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Project implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The name. */
	@NotNull
	@Size(max = 256)

	@Column(unique = true)
	private String name;

	/** The description. */
	@Size(max = 256)
	private String description;

	/** The last updated. */
	@Column(name = "last_updated")
	private Date lastUpdated;

	/** Project Logo Name *. */
	@Column(name = "logo_name")
	private String logoName;

	/** The logo. */
	private byte[] logo;

	/** The defaultrole. */
	@Column(name = "default_role")
	private Boolean defaultrole;

	/** The portfolio id. */
	@JoinColumn(name = "portfolio_id")
	@ManyToOne
	private UsmPortfolio portfolioId;

	/** The projectdisplayname. */
	@Size(max = 256)
	@Column(name = "project_display_name")
	private String projectdisplayname;

	/** The theme. */
	private String theme;

	/** The domain name. */
	@Column(name = "domain_name")
	private String domainName;

	/** The product details. */
	@Column(name = "product_details")
	private String productDetails;

	/** The time zone. */
	@Column(name = "time_zone")
	private String timeZone;

	/** The azure org id. */
	@Column(name = "azure_org_id")
	private String azureOrgId;

	/** The provisioneddate. */
	@Column(name = "provisioned_date")
	private Date provisioneddate;

	/** Disable Excel? */
	@Column(name = "disable_excel")
	private Boolean disableExcel;

	/** Created Date */
	@Column(name = "created_date", columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP", insertable = false, updatable = false)
	private Timestamp createdDate;
	
	@Column(name = "project_autologin")
	private Boolean projectAutologin;
	
	@JoinColumn(name = "autologin_role")
	@ManyToOne
	private Role autologinRole;

	/**
	 * To string.
	 *
	 * @return the string
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "Project{" + ", id='" + getId() + "'" + "}";

	}

}
