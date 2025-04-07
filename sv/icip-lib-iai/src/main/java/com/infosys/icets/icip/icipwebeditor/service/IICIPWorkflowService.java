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
package com.infosys.icets.icip.icipwebeditor.service;

import java.sql.SQLException;
import java.util.List;

import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflow;
import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflowSpec;


// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPWorkflowService.
 */
public interface IICIPWorkflowService {

	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP workflow training
	 */
	public ICIPWorkflow findOne(Integer id);
	
	/**
	 * Find one.
	 *
	 * @param name the name
	 * @return the ICIP workflow
	 */
	public ICIPWorkflowSpec findByName(String name);
		
	
	/**
	 * Find by wkspec.
	 *
	 * @param wkpec the wkpec
	 * @return the list
	 */
	public List<ICIPWorkflow> findByWkspec(ICIPWorkflowSpec wkpec);
	
	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP workflow
	 */
	public ICIPWorkflowSpec findById(Integer id);


	/**
	 * Save.
	 *
	 * @param workflow the workflow
	 * @return the ICIP streaming services
	 */
	public ICIPWorkflow save(ICIPWorkflow workflow);

	/**
	 * Save.
	 *
	 * @param workflow the workflow
	 * @return the ICIP streaming services
	 */
	public ICIPWorkflowSpec saveSpec(ICIPWorkflowSpec workflow);

	/**
	 * Update.
	 *
	 * @param workflow the workflow
	 * @return the ICIP streaming services
	 * @throws SQLException the SQL exception
	 */
	public ICIPWorkflowSpec updateSpec(ICIPWorkflowSpec workflow) throws SQLException;

	/**
	 * Update.
	 *
	 * @param workflow the workflow
	 * @return the ICIP workflow
	 * @throws SQLException the SQL exception
	 */
	public ICIPWorkflow update(ICIPWorkflow workflow) throws SQLException;


	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	public void delete(Integer id) throws SQLException;
	
	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	public void deleteSpec(Integer id) throws SQLException;


	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	public List<ICIPWorkflow> findByOrganization(String fromProjectId);

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean copy(String fromProjectId, String toProjectId);


	/**
	 * Gets the all pipelines.
	 *
	 * @return the all pipelines
	 */
	List<ICIPWorkflow> getAllWorkflows();

	/**
	 * Gets the all pipelines by org.
	 *
	 * @param org the org
	 * @return the all pipelines by org
	 */
	List<ICIPWorkflow> getAllByOrg(String org);

	/**
	 * Gets the ICIP streaming services.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP streaming services
	 */
	ICIPWorkflow getWorkflow(String name, String org);

	/**
	 * Gets the all workflow specs.
	 *
	 * @return the all workflow specs
	 */
	public List<ICIPWorkflowSpec> getAllWorkflowSpecs();

	/**
	 * Find by wkspec name.
	 *
	 * @param wkspec the wkspec
	 * @return the list
	 */
	public List<ICIPWorkflow> findByWkspecName(String wkspec);
	
	public List<ICIPWorkflow> findByWkspecNameAndOrg(String wkspec,String org);

	public int countByName(String name);

	
}
