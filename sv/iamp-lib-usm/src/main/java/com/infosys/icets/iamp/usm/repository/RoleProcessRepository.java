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
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.RoleProcess;

@Repository("usmRoleProcessRepository")
public interface RoleProcessRepository extends JpaRepository<RoleProcess, Integer> {

	@Query(value = "SELECT c from RoleProcess c WHERE c.process_id.process_id= :id")
	List<RoleProcess> findByRoleProcessIdentityProcessId(@Param("id") Integer id);
	
	@Query(value = "SELECT c from RoleProcess c WHERE c.role_id.id= :id")
	List<RoleProcess> findByRoleProcessIdentityRoleId(@Param("id") Integer id);
	
	@Modifying
	@Query(value = "DELETE from RoleProcess c WHERE c.process_id.process_id= :id")
	void deleteByRoleProcessIdentityProcessId(@Param("id") Integer id);
	
	@Modifying
	@Query(value = "DELETE from RoleProcess c WHERE c.role_id.id= :id")
	void deleteByRoleProcessIdentityRoleId(@Param("id") Integer id);
}
