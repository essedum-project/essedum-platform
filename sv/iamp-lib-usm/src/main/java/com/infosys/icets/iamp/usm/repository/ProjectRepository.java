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

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.Project2;


// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the Project entity.
 */
/**
* @author icets
*/
@SuppressWarnings("unused")
//@Repository("usmProjectRepository")
@NoRepositoryBean
public interface ProjectRepository extends JpaRepository<Project,Integer> {
    
	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the project
	 */
	public Project findByName(String name);
	
	/**
	 * Find by id.
	 *
	 * @param projectId the project id
	 * @return the optional
	 */
	/* (non-Javadoc)
	 * @see org.springframework.data.repository.CrudRepository#findById(java.lang.Object)
	 */
	public Optional<Project> findById(Integer projectId);
	
	
	/**
   	 * Update project.
   	 *
   	 * @param projectId the project id
   	 * @param updatedDate the updated date
   	 * @return the int
   	 */
//   	@Query("UPDATE usm_project c SET c.last_updated = :updatedDate WHERE c.id = :projectId")
	    int updateProject(@Param("projectId") Integer projectId,@Param("updatedDate") ZonedDateTime updatedDate);
	   
   	/**
	    * Find all names.
	    *
	    * @return the list
	    */
//	   @Query(value = "select name from usm_project", nativeQuery = true)
	public List<String> findAllNames();
//	@Query(value="select distinct * from usm_project where portfolio_id=:portfolioId",nativeQuery = true)
   	public List<Project> getProjectsById(@Param("portfolioId") Integer portfolioId) ;

	@Query(value = "select id from usm_project where portfolio_id= ?1", nativeQuery = true)
	public List<Integer> findProjectIdsForPortfolio(Integer portfolioId);
	
}
