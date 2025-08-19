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

package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;
import java.util.Optional;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPApps;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices3DTO;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the StreamingServices entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
@Transactional
public interface ICIPStreamingServicesRepository extends JpaRepository<ICIPStreamingServices, Integer> {
	

	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the ICIP streaming services
	 */
	ICIPStreamingServices findByName(String name);

	/**
	 * Gets the by group name and organization.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @return the by group name and organization
	 */
	List<ICIPStreamingServices> getByGroupNameAndOrganization(String groupName, String organization);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP streaming services
	 */
	ICIPStreamingServices findByNameAndOrganization(String name, String org);
	
	ICIPStreamingServices findByAliasAndOrganization(String alias, String org);
	
	ICIPStreamingServices findByAliasAndInterfacetypeAndOrganization(String alias, String interfacetype, String org);

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	List<NameAndAliasDTO> findByOrganization(String fromProjectId);

	List<NameAndAliasDTO> findByInterfacetypeAndOrganization(String template,String fromProjectId);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	void deleteByProject(String project);

	/**
	 * Count by name.
	 *
	 * @param name the name
	 * @return the long
	 */
	Long countByName(String name);

	/**
	 * Gets the name and alias.
	 *
	 * @param groupName the group name
	 * @param org the org
	 * @return the name and alias
	 */
	List<NameAndAliasDTO> getNameAndAlias(String groupName, String org);
	


	/**
	 * Ssgj result.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPStreamingServices3DTO> ssgjResult(String groupName, String organization, Pageable pageable);

	/**
	 * Ssgj search result.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param search       the search
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPStreamingServices3DTO> ssgjSearchResult(String groupName, String organization, String search,
			Pageable pageable);

	/**
	 * Ssgj result len.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @return the long
	 */
	Long ssgjResultLen(String groupName, String organization);

	/**
	 * Ssgj search result len.
	 *
	 * @param groupName    the group name
	 * @param organization the organization
	 * @param search       the search
	 * @return the long
	 */
	Long ssgjSearchResultLen(String groupName, String organization, String search);

	/**
	 * Gets the all pipelines by type and group.
	 *
	 * @param type   the type
	 * @param org    the org
	 * @param group  the group
	 * @param search the search
	 * @return the all pipelines by type and group
	 */
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeAndGroup(String type, String org, String group,
			String search);

	
	/**
	 * Find by.
	 *
	 * @param example the example
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPStreamingServices2DTO> findBy(Example<ICIPStreamingServices> example, Pageable pageable);

	/**
	 * Find by.
	 *
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPStreamingServices2DTO> findBy(Pageable pageable);

	/**
	 * Find by.
	 *
	 * @return the list
	 */
	List<ICIPStreamingServices2DTO> findBy();

	/**
	 * Gets the by organization.
	 *
	 * @param org the org
	 * @return the by organization
	 */
	List<ICIPStreamingServices2DTO> getByOrganization(String org);

	/**
	 * Gets the by type and organization.
	 *
	 * @param type the type
	 * @param org the org
	 * @return the by type and organization
	 */
	List<ICIPStreamingServices2DTO> getByTypeAndOrganizationAndInterfacetype(String type, String org,String interfacetype);
	
	List<ICIPStreamingServices2DTO> getByInterfacetypeAndOrganization(String interfacetype, String org);

	
	List<ICIPStreamingServices3DTO> ssgjTemplateResult(String groupName, String organization, String interfacetype,
			Pageable of);
	
	List<String> getPipelinesTypeByOrganization(String organization);

	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeandOrg(List<String> project, Pageable paginate,String query,
			String type, String interfacetype);
	
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeandOrgForApps(List<String> project, Pageable paginate,String query,
			String type, String interfacetype);
	
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeandOrgWithTag(List<String> project, Pageable paginate,String query,
			List<Integer> tags,	String type, String interfacetype);

	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeandOrgWithTagForApp(List<String> project, Pageable paginate,String query,
			List<Integer> tags,	String type, String interfacetype);

	Long getPipelinesCountByTypeandOrg(List<String> project, String query, String type,String interfacetype);
	
	Long getPipelinesCountByTypeandOrgForApps(List<String> project, String query, String type,String interfacetype);

	ICIPStreamingServices getTemplateByName(String name, String org);

	List<ICIPStreamingServices2DTO> getAllTemplatesByTypeandOrg(String project, Pageable paginate, String query,
			String type);

	Long getTemplatesCountByTypeandOrg(String project, String query, String type);
	
	
	List<ICIPStreamingServices> findByOrganization(String search, String org,Pageable page);
	List<ICIPStreamingServices> findAppByOrganization(String search, String org,Pageable page);
	
	List<ICIPStreamingServices> getByAliasAndOrganization(String alias,String org);

	Long getPipelinesCountByTypeandOrgWithTag(List<String> project, String query, List<Integer> tags, String type,
			String interfacetype);
	
	Long getPipelinesCountByTypeandOrgWithTagForApps(List<String> project, String query, List<Integer> tags, String type,
			String interfacetype);
	

	Optional<ICIPStreamingServices> findByNameAndOrganizationAndDeleted(String name, String organization,
			boolean deleted);

	List<ICIPStreamingServices> getAllByOrganization(String org);
	
	List<ICIPStreamingServices2DTO> getPipelineByNameAndOrg(String name,String org);

	Optional<ICIPStreamingServices> findByCidAndType(Integer id, String string);


}
