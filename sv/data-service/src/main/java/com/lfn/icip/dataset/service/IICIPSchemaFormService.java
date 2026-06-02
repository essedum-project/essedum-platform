package com.lfn.icip.dataset.service;

import java.util.List;

import org.slf4j.Marker;

import com.lfn.icip.dataset.model.ICIPSchemaForm;

public interface IICIPSchemaFormService {
	
	/**
	 * Fetch schema form template.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the string
	 */
	
	ICIPSchemaForm fetchSchemaFormTemplateByNameAndOrg(String templatename, String org);
	
	ICIPSchemaForm fetchSchemaFormTemplate(String templatename,String schema, String org);

	List<ICIPSchemaForm> fetchSchemaForm(String schema, String org);

	void delete(Integer id);

	ICIPSchemaForm save(ICIPSchemaForm schemaForm);
	
	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param projectId     the project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId, int projectId);

//	List<ICIPSchemaForm> getschemabySchemaNameAndOrg(String schema, String org);

}
