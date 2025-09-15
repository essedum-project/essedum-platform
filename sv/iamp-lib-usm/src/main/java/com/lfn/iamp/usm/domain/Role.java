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

package com.lfn.iamp.usm.domain;

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
import com.lfn.iamp.usm.common.ProjectDomain;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A Role.
 */
/**
* @author essedum
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
