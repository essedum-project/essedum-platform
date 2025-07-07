/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
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
