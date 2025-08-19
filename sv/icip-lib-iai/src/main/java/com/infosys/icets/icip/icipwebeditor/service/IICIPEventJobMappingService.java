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
