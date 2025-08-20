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

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import jakarta.persistence.CascadeType;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmRolePermissions.
 *
 * @author essedum
 */

/**
 * Gets the role permission.
 *
 * @return the role permission
 */

/**
 * Gets the role.
 *
 * @return the role
 */

/**
 * Gets the role.
 *
 * @return the role
 */
@Getter

/**
 * Sets the role permission.
 *
 * @param role the new role permission
 */

/**
 * Sets the role.
 *
 * @param role the new role
 */

/**
 * Sets the role.
 *
 * @param role the new role
 */
@Setter
//@NamedNativeQueries(value = {
//		@NamedNativeQuery(name = "UsmRolePermissions.getPermissionByRoleAndModule", query = "SELECT * from `usm_permissions` where"
//				+ " `module`=:module AND `id` = (SELECT `permission` from `usm_role_permissions` where `role`=:role)", resultClass = UsmPermissions.class) })
@Entity
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id", scope = UsmRolePermissions.class)
@Table(name = "usm_role_permissions")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UsmRolePermissions implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	/** The role. */
	@JoinColumn(name="role")
	@ManyToOne
	private Role role;
	
	
	/** The permission. */
	@JoinColumn(name="permission")
	@ManyToOne
	private UsmPermissions permission;


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
		return "RolePermission{" + ", id='" + getId() + "'" + "}";

	}

}
