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
import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.infosys.icets.iamp.usm.common.ProjectDomain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A Role.
 */
/**
* @author icets
*/

/**
 * Gets the roleadmin.
 *
 * @return the roleadmin
 */

/**
 * Gets the projectadmin.
 *
 * @return the projectadmin
 */
@Getter

/**
 * Sets the roleadmin.
 *
 * @param roleadmin the new roleadmin
 */

/**
 * Sets the projectadmin.
 *
 * @param projectadmin the new projectadmin
 */
@Setter
@Entity

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = Role.class)
@Table(name = "usm_role")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Role extends ProjectDomain implements Serializable {

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
	private String name;

	/** The description. */
	@Size(max = 256)
	private String description;

	/** The permission. */
	private Boolean permission;

	/** The roleadmin. */
	@Column(name = "role_admin")
	private Boolean roleadmin;
	
	/** The projectadmin. */
	@Column(name = "project_admin")
	private Boolean projectadmin;
	
	/** The project id. */
	@Column(name = "portfolio_id")
	private Integer portfolioId;
	
	@Column(name = "project_admin_id")
	private Integer projectAdminId;
	
}
