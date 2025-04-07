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
 * @author icets
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
