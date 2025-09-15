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

package com.lfn.iamp.usm.repository.mssql;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.repository.ProjectRepository;

@Profile("mssql")
@Repository
public interface ProjectRepositoryMSSQL extends ProjectRepository{
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
