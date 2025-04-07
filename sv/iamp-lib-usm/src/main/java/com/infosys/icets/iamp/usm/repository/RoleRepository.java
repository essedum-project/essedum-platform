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
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.Role;


// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the Role entity.
 */
/**
* @author icets
*/
@SuppressWarnings("unused")
@Repository("usmRoleRepository")
public interface RoleRepository extends JpaRepository<Role,Integer> {
	
	/**
	 * Find by name.
	 *
	 * @param roleName the role name
	 * @return the list
	 */
	public List<Role> findByName(String roleName);
	
	public List<Role> findByNameAndProjectId(String roleName,int projectId);
	
	@Query(value="SELECT r.id,r.name FROM Role r JOIN RoleProcess pr ON r.id = pr.role_id.id WHERE pr.process_id.process_id =?1")
	List<Object[]> getAllRolesByProcessId(Integer processId);
	
	@Query(value="SELECT r FROM Role r WHERE r.name LIKE CONCAT(?1,'_%')")
	List<Role> getAllRolesByProcess(String process);
    
}
