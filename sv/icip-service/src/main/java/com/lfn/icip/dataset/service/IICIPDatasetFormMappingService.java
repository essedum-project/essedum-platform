package com.lfn.icip.dataset.service;

import java.util.List;

import org.slf4j.Marker;

import com.lfn.icip.dataset.model.ICIPDatasetFormMapping;
import com.lfn.icip.dataset.model.ICIPDatasetFormMapping2;
import com.lfn.icip.dataset.model.ICIPSchemaForm;

public interface IICIPDatasetFormMappingService {
	
	List<ICIPDatasetFormMapping> fetchDatasetFormMapping(String name, String org);

	void save(ICIPDatasetFormMapping2 form);

	void delete(ICIPDatasetFormMapping form);

	void deleteByFormtemplateAndDataset(ICIPSchemaForm icipSchemaForm, String dataset);
	
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

	ICIPDatasetFormMapping findByDatasetAndFormtemplateAndOrganization(String dataset, ICIPSchemaForm form, String org);
}
