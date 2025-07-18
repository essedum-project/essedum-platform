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

import java.util.List;

import org.slf4j.Marker;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.IICIPJobRuntimeServiceUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPEventJobMapping;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPEventJobMappingService.
 *
 * @author icets
 */
public interface IICIPEventJobMappingService {

	/**
	 * Find by event name.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP event job mapping
	 */
	ICIPEventJobMapping findByEventName(String name, String org);

	/**
	 * Find by org.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPEventJobMapping> findByOrg(String org);

	/**
	 * Find by org and search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param page   the page
	 * @param size   the size
	 * @return the list
	 */
	List<ICIPEventJobMapping> findByOrgAndSearch(String org, String search, int page, int size);

	/**
	 * Count by org and search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the count
	 */
	Long countByOrgAndSearch(String org, String search);

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP event job mapping
	 */
	ICIPEventJobMapping findById(Integer id);

	/**
	 * Save.
	 *
	 * @param event the event
	 * @return the ICIP event job mapping
	 */
	ICIPEventJobMapping save(ICIPEventJobMapping event);

	/**
	 * Delete.
	 *
	 * @param id the id
	 */
	void delete(Integer id);

	/**
	 * Delete.
	 *
	 * @param name the name
	 * @param org  the org
	 */
	void delete(String name, String org);

	/**
	 * Checks if is valid event.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return true, if is valid event
	 */
	boolean isValidEvent(String name, String org);

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId);

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	void delete(String project);

	/**
	 * Trigger.
	 *
	 * @param name the name
	 * @param org the org
	 * @param corelid the corelid
	 * @param params the params
	 * @return the string
	 * @throws LeapException the leap exception
	 */
	String trigger(String name, String org, String corelid, String params, String datasource) throws LeapException;

	/**
	 * Gets the api classes.
	 *
	 * @return the api classes
	 */
	List<String> getApiClasses();

	void setClass(Class<?> classType);
	
	

	
	boolean copytemplate(Marker marker, String fromProjectId, String toProjectId);

}
