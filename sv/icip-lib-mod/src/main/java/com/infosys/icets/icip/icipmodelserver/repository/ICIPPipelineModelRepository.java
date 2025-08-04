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

package com.infosys.icets.icip.icipmodelserver.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipmodelserver.model.ICIPPipelineModel;

// TODO: Auto-generated Javadoc
/**
 * Spring Data JPA repository for the ICIPPipelineModel entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPPipelineModelRepository extends JpaRepository<ICIPPipelineModel, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the list
	 */
	List<ICIPPipelineModel> findByOrganization(String org, Pageable pageable);

	/**
	 * Find running or failed uploads.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPPipelineModel> findRunningOrFailedUploads(String org);

	/**
	 * Find by modelname and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP pipeline model
	 */
	ICIPPipelineModel findByModelnameAndOrganization(String name, String org);

	/**
	 * Find by fileid.
	 *
	 * @param fileid the fileid
	 * @return the ICIP pipeline model
	 */
	ICIPPipelineModel findByFileid(String fileid);

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	Long countByOrganization(String org);

	/**
	 * Find by organization.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param pageable the pageable
	 * @return the list
	 * @throws LeapException the leap exception
	 */
	List<ICIPPipelineModel> findByOrganizationAndSearch(String org, String search, Pageable pageable)
			throws LeapException;

	/**
	 * Count by organization.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the long
	 */
	Long countByOrganizationAndSearch(String org, String search);

	/**
	 * Find by status.
	 *
	 * @param status the status
	 * @return the list
	 */
	List<ICIPPipelineModel> findByStatus(Integer status);

	/**
	 * Find by status and organization.
	 *
	 * @param status the status
	 * @param org the org
	 * @return the list
	 */
	List<ICIPPipelineModel> findByStatusAndOrganization(Integer status, String org);

	/**
	 * Find by status and modelserver.
	 *
	 * @param status      the status
	 * @param modelserver the modelserver
	 * @return the list
	 */
	List<ICIPPipelineModel> findByStatusAndModelserver(Integer status, Integer modelserver);

	/**
	 * Find by modelserver.
	 *
	 * @param modelserver the modelserver
	 * @return the list
	 */
	List<ICIPPipelineModel> findByModelserver(Integer modelserver);

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	List<NameAndAliasDTO> getNameAndAlias(String group, String org);

	List<ICIPPipelineModel> getPipelineModelsByOrganization(String org);
	
	ICIPPipelineModel customSave(ICIPPipelineModel model);
}
