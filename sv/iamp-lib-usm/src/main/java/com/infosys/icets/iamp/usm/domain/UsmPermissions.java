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

package com.infosys.icets.iamp.usm.domain;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmPermissions.
 *
 * @author icets
 */

/**
 * Gets the permission.
 *
 * @return the permission
 */

/**
 * Gets the permission.
 *
 * @return the permission
 */
@Getter

/**
 * Sets the permission.
 *
 * @param permission the new permission
 */

/**
 * Sets the permission.
 *
 * @param permission the new permission
 */
@Setter

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
@Entity
//@NamedNativeQueries(value = {
//		@NamedNativeQuery(name = "UsmPermissions.getPermissionByRoleAndModule", query = "SELECT * from `usm_permissions` where"
//				+ " `module`=:module AND `id` IN (SELECT `permission` from `usm_role_permissions` where `role`=:role)", resultClass = UsmPermissions.class) })
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = UsmPermissions.class)
@Table(name = "usm_permissions")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UsmPermissions implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The module. */
	@NotNull
	@Size(max = 256)
	private String module;

	/** The permission. */
	@NotNull
	@Size(max = 256)
	private String permission;
	
	/** The resources. */
	// @Size(max = 256)
	// private String resources;
	
	// @JoinColumn(name = "module_id")
	// @ManyToOne
	// private UsmModule module_id;

}
