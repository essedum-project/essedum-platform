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
