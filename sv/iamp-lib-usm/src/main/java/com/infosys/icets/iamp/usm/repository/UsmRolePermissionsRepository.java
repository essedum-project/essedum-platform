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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.UsmRolePermissions;


// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the UsmRolePermissions entity.
 */
/**
* @author icets
*/
@SuppressWarnings("unused")
@Repository
public interface UsmRolePermissionsRepository extends JpaRepository<UsmRolePermissions,Integer> {

	/**
	 * Gets the permission by role and module.
	 *
	 * @param role the role
	 * @param module the module
	 * @return the permission by role and module
	 */
	@Query("SELECT u from UsmPermissions u where u.module=:module and u.id IN (SELECT x.permission.id from UsmRolePermissions x where x.role.id=:role)")
	List<UsmRolePermissions> getPermissionByRoleAndModule(@Param("role") Integer role,@Param("module")String module);
    
	

	/**
	 * Gets the UsmRolePermissions .
	 * @param module the module
	 * @return the Page of UsmRolePermissions 
	 */
	@Query("SELECT u from UsmRolePermissions u where u.permission.module like %:module%")
	Page<UsmRolePermissions> findAllByUsmRolePermissionsModule(@Param("module")String module,Pageable page);
	
	/**
	 * Gets the UsmRolePermissions .
	 * @param module the module
	 * @param module the permission
	 * @return the Page of UsmRolePermissions 
	 */
	@Query("SELECT u from UsmRolePermissions u where u.permission.module like %:module% and u.permission.permission like %:permission%")
	Page<UsmRolePermissions> findAllUsmRolePermissionsByModuleAndPermission(@Param("module")String module,@Param("permission")String permission,Pageable page);

	/**
	 * Gets the UsmRolePermissions .
	 * @param module the module
	 * @param module the permission
	 * @param role the role name
	 * @return the Page of UsmRolePermissions 
	 */
	@Query("SELECT u from UsmRolePermissions u where u.permission.module like %:module% and u.permission.permission like %:permission% and u.role.name like %:name%")
	Page<UsmRolePermissions> findAllUsmRolePermissionsByModuleAndPermissionAndRole(@Param("module")String module,@Param("permission")String permission,@Param("name")String name,Pageable page);
	
	/**
	 * Gets the UsmRolePermissions .
	 * @param module the module
	 * @param role the role name
	 * @return the Page of UsmRolePermissions 
	 */
	@Query("SELECT u from UsmRolePermissions u where u.permission.module like %:module%")
	Page<UsmRolePermissions> findAllUsmRolePermissionsByModule(@Param("module")String module,Pageable page);

	
	/**
	 * Gets the UsmRolePermissions .
	 * @param module the permission
	 * @param role the role name
	 * @return the Page of UsmRolePermissions 
	 */
	@Query("SELECT u from UsmRolePermissions u where u.permission.permission like %:permission%")
	Page<UsmRolePermissions> findAllUsmRolePermissionsByPermission(@Param("permission")String permission,Pageable page);

}
