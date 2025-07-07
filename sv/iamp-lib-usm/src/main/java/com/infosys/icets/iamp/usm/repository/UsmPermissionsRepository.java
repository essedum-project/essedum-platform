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
package com.infosys.icets.iamp.usm.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.UsmPermissions;  

// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the UsmRolePermissions entity.
 */
/**
* @author icets
*/
@SuppressWarnings("unused")
@Repository
public interface UsmPermissionsRepository extends JpaRepository<UsmPermissions,Integer> {
	
	/**
	 * Gets the permission by role and module.
	 *
	 * @param role the role
	 * @param module the module
	 * @return the permission by role and module
	 */
	@Query("SELECT u from UsmPermissions u where u.module=:module and u.id IN (SELECT x.permission.id from UsmRolePermissions x where x.role.id=:role)")
	List<UsmPermissions> getPermissionByRoleAndModule(@Param("role") Integer role,@Param("module")String module);
    
}