package com.infosys.icets.icip.icipwebeditor.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infosys.icets.icip.icipwebeditor.model.ICIPWorkflowSpec;


// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPWorkflowSpecRepository.
 */
public interface ICIPWorkflowSpecRepository extends JpaRepository<ICIPWorkflowSpec, Integer>{
	
	/**
	 * Find by wkname.
	 *
	 * @param name the name
	 * @return the ICIP workflow spec
	 */
	ICIPWorkflowSpec findByWkname( String name);
	
	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP workflow spec
	 */
	ICIPWorkflowSpec findById( Long id);
	
	

	

}
