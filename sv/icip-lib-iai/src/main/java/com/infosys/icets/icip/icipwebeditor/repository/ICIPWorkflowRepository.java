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
package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflow;
import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflowSpec;


// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPWorkflowRepository.
 */
@NoRepositoryBean
@Transactional
public interface ICIPWorkflowRepository extends JpaRepository<ICIPWorkflow, Integer>{
	
	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the ICIP workflow training
	 */
	ICIPWorkflow findByName(String name);


	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP workflow training
	 */
	ICIPWorkflow findByNameAndOrganization(String name, String org);

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	List<ICIPWorkflow> findByOrganization(String fromProjectId);
	
	/**
	 * Find by wkspec.
	 *
	 * @param wkspec the wkspec
	 * @return the list
	 */
	List<ICIPWorkflow> findByWkspec(ICIPWorkflowSpec wkspec);


	/**
	 * Find by wkspec name.
	 *
	 * @param wkspec the wkspec
	 * @return the list
	 */
	List<ICIPWorkflow> findByWkspecName(String wkspec);


	/**
	 * Find by wkspec name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the list
	 */
	List<ICIPWorkflow> findByWkspecNameAndOrganization(String wkspec, String org);


	int countByName(String name);
}
