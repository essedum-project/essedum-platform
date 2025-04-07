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
package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflow;
import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflowSpec;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPWorkflowRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPWorkflowSpecRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPWorkflowService;


// TODO: Auto-generated Javadoc
/**
 * The Class ICIPWorkflowService.
 */
@Service
@Transactional
public class ICIPWorkflowService implements IICIPWorkflowService {
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPWorkflowService.class);

	/** The workflow repository. */
	@Autowired
	private ICIPWorkflowRepository workflowRepository;
	
	/** The wk spec repository. */
	@Autowired
	private ICIPWorkflowSpecRepository wkSpecRepository;

	
	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP workflow
	 */
	public ICIPWorkflow findOne(Integer id) {
		logger.info("Fetching workflow by Id {}", id);
		return workflowRepository.findById(id).get();
	}

	/**
	 * Save.
	 *
	 * @param workflow the workflow
	 * @return the ICIP workflow
	 */
	@Override
	public ICIPWorkflow save(ICIPWorkflow workflow) {
		return workflowRepository.save(workflow);
	}

	/**
	 * Save spec.
	 *
	 * @param workflow the workflow
	 * @return the ICIP workflow spec
	 */
	@Override
	public ICIPWorkflowSpec saveSpec(ICIPWorkflowSpec workflow) {
		logger.info("Saving workflow Spec {}", workflow.getWkname());
		return wkSpecRepository.save(workflow);
	}

	
	/**
	 * Update.
	 *
	 * @param workflow the workflow
	 * @return the ICIP workflow
	 * @throws SQLException the SQL exception
	 */
	public ICIPWorkflow update(ICIPWorkflow workflow)
			throws SQLException {
		ICIPWorkflow fetched = workflowRepository.findById(workflow.getId()).get();
		if (workflow.getDescription() != null)
			fetched.setDescription(workflow.getDescription());
		if (workflow.getName() != null)
			fetched.setName(workflow.getName());
		if (workflow.getCurrentStage() != null)
			fetched.setCurrentStage(workflow.getCurrentStage());
		if (workflow.getOrganization() != null)
			fetched.setOrganization(workflow.getOrganization());
		if (workflow.getCorelid() != null)
			fetched.setCorelid(workflow.getCorelid());
		if (workflow.getUpdatedBy() != null)
			fetched.setUpdatedBy(workflow.getUpdatedBy());
		if (workflow.getWkspec() != null)
			fetched.setWkspec(workflow.getWkspec());
		if (workflow.getWorkflowData() != null)
			fetched.setWorkflowData(workflow.getWorkflowData());
		fetched.setUpdatedOn(new Timestamp(System.currentTimeMillis()));
		logger.info("Updating streaming service {}", fetched.getName());
		return workflowRepository.save(fetched);
	}

	
	/**
	 * Update spec.
	 *
	 * @param workflow the workflow
	 * @return the ICIP workflow spec
	 * @throws SQLException the SQL exception
	 */
	public ICIPWorkflowSpec updateSpec(ICIPWorkflowSpec workflow) throws SQLException {
		ICIPWorkflowSpec fetched = wkSpecRepository.findById(workflow.getId()).get();
		if (workflow.getWkname() != null)
			fetched.setWkname(workflow.getWkname());
		if (workflow.getWkspec() != null)
			fetched.setWkspec(workflow.getWkspec());	
		return wkSpecRepository.save(fetched);
	}

	
	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	public void delete(Integer id) throws SQLException {
		workflowRepository.deleteById(id);
		logger.info("Deleting workflow by Id {}", id);
		
	}
	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 */
	public void deleteSpec(Integer id) throws SQLException {
		ICIPWorkflowSpec fetched = wkSpecRepository.findById(id).get();
		List<ICIPWorkflow> fetchedWorkflow = workflowRepository.findByWkspec(fetched);
		for(int i=0;i<fetchedWorkflow.size();++i) {
			workflowRepository.deleteById(fetchedWorkflow.get(i).getId());
		}
		wkSpecRepository.deleteById(id);
		logger.info("Deleting workflow by Id {}", id);
		
	}

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	@Override
	public List<ICIPWorkflow> findByOrganization(String fromProjectId) {
		return workflowRepository.findByOrganization(fromProjectId);
	}

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(String fromProjectId, String toProjectId) {
		logger.info("Fetching jobs for Entity {}", fromProjectId);
		List<ICIPWorkflow> icGrps = workflowRepository.findByOrganization(fromProjectId);
		List<ICIPWorkflow> toGrps = icGrps.parallelStream().map(grp -> {
			grp.setId(null);
			grp.setOrganization(toProjectId);
			return grp;
		}).collect(Collectors.toList());
		toGrps.stream().forEach(grp -> workflowRepository.save(grp));
		return true;
	}



	/**
	 * Gets the all workflows.
	 *
	 * @return the all workflows
	 */
	@Override
	public List<ICIPWorkflow> getAllWorkflows() {
		logger.debug("Getting all pipelines");
		return workflowRepository.findAll();
	}

	/**
	 * Gets the all by org.
	 *
	 * @param org the org
	 * @return the all by org
	 */
	@Override
	public List<ICIPWorkflow> getAllByOrg(String org) {
		logger.debug("Getting all pipelines by organization");
		Example<ICIPWorkflow> example = null;
		ICIPWorkflow workflow = new ICIPWorkflow();
		workflow.setOrganization(org);
		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("organization",
				match -> match.ignoreCase().exact());
		example = Example.of(workflow, matcher);
		return workflowRepository.findAll(example);
	}

	/**
	 * Gets the workflow.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the workflow
	 */
	@Override
	public ICIPWorkflow getWorkflow(String name, String org) {
		return workflowRepository.findByNameAndOrganization(name, org);
	}


	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the ICIP workflow spec
	 */
	@Override
	public ICIPWorkflowSpec findByName(String name) {
		return wkSpecRepository.findByWkname(name);
	}
	
	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP workflow spec
	 */
	@Override
	public ICIPWorkflowSpec findById(Integer id) {
		return wkSpecRepository.findById(id).get();
	}


	/**
	 * Gets the all workflow specs.
	 *
	 * @return the all workflow specs
	 */
	@Override
	public List<ICIPWorkflowSpec> getAllWorkflowSpecs() {
		return wkSpecRepository.findAll();
	}


	/**
	 * Find by wkspec.
	 *
	 * @param wkspec the wkspec
	 * @return the list
	 */
	@Override
	public List<ICIPWorkflow> findByWkspec(ICIPWorkflowSpec wkspec) {
		return workflowRepository.findByWkspec(wkspec);
	}


	/**
	 * Find by wkspec name.
	 *
	 * @param wkspec the wkspec
	 * @return the list
	 */
	@Override
	public List<ICIPWorkflow> findByWkspecName(String wkspec) {
		return  workflowRepository.findByWkspecName(wkspec);
	}

	@Override
	public List<ICIPWorkflow> findByWkspecNameAndOrg(String wkspec, String org) {

		return workflowRepository.findByWkspecNameAndOrganization(wkspec,org);
	}

	@Override
	public int countByName(String name) {
		// TODO Auto-generated method stub
		
		return workflowRepository.countByName(name);
	}

	


}
