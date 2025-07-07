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

import lombok.Getter;
import lombok.Setter;
// TODO: Auto-generated Javadoc
/**
 * The Class UsmRolePermissionNewDTO.
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
public class UsmRolePermissionNewDTO implements Serializable{

	/** The id. */
	private Integer id;
	
	/** The role. */
	private RoleDTO role;

	/** The permission. */
	private UsmPermissionsDTO permission;

	@Override
	public String toString() {
		return "UsmRolePermissionNewDTO [id=" + id + ", role=" + role + ", permission=" + permission + "]";
	}

}
