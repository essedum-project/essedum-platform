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
package com.infosys.icets.iamp.usm.repository.mysql;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.repository.ProjectRepository;

@Profile("mysql")
@Repository
public interface ProjectRepositoryMYSQL extends ProjectRepository{
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
   		@Query(value="UPDATE usm_project SET last_updated = ?2 WHERE id = ?1",nativeQuery = true)
	    int updateProject(@Param("projectId") Integer projectId,@Param("updatedDate") ZonedDateTime updatedDate);
	   
   	/**
	    * Find all names.
	    *
	    * @return the list
	    */
   @Query(value = "select name from usm_project", nativeQuery = true)
	public List<String> findAllNames();
	
	
	@Query(value="select distinct * from usm_project where portfolio_id=:portfolioId",nativeQuery = true)
   	public List<Project> getProjectsById(@Param("portfolioId") Integer portfolioId) ;

}
