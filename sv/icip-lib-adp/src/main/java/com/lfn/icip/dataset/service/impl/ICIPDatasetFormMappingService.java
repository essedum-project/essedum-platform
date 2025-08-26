package com.lfn.icip.dataset.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.model.ICIPDatasetFormMapping;
import com.lfn.icip.dataset.model.ICIPDatasetFormMapping2;
import com.lfn.icip.dataset.model.ICIPSchemaForm;
import com.lfn.icip.dataset.repository.ICIPDatasetFormMappingRepository;
import com.lfn.icip.dataset.repository.ICIPDatasetFormMappingRepository2;
import com.lfn.icip.dataset.service.IICIPDatasetFormMappingService;

@Service
@Transactional
public class ICIPDatasetFormMappingService implements IICIPDatasetFormMappingService{
	

	@Autowired
	private ICIPDatasetFormMappingRepository datasetFormRepository;
	
	@Autowired
	private ICIPDatasetFormMappingRepository2 datasetFormRepository2;
	
	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);


	@Override
	public List<ICIPDatasetFormMapping> fetchDatasetFormMapping(String name, String org) {
		return datasetFormRepository.getByDatasetAndOrganization(name, org);
	}
	
	@Override
	public ICIPDatasetFormMapping findByDatasetAndFormtemplateAndOrganization(String dataset,ICIPSchemaForm form, String org) {
		return datasetFormRepository.findByDatasetAndFormtemplateAndOrganization(dataset, form, org);
	}
	
	@Override
	public void save(ICIPDatasetFormMapping2 form) {
		datasetFormRepository2.save(form);
	}
	
	@Override
	public void delete(ICIPDatasetFormMapping form) {
		datasetFormRepository.delete(form);
	}

	@Override
	public void deleteByFormtemplateAndDataset(ICIPSchemaForm formtemplate, String dataset) {
		datasetFormRepository.deleteByFormtemplateAndDataset(formtemplate.getName(), dataset);
		
	}

	@Override
	public boolean copy(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId) {
		List<ICIPDatasetFormMapping> forms = datasetFormRepository.findByOrganization(fromProjectId);
		List<ICIPDatasetFormMapping> toForms = forms.parallelStream().map(form -> {
			form.setId(null);
			form.setOrganization(toProjectId);
			return form;
		}).collect(Collectors.toList());
		toForms.stream().forEach(form -> {
			ICIPDatasetFormMapping schemaform = findByDatasetAndFormtemplateAndOrganization(form.getDataset(),form.getFormtemplate(), form.getOrganization());
			String id = null;
			if (schemaform != null) {
				form.setId(schemaform.getId());
				id = schemaform.getId().toString();
			}
			try {
				ICIPDatasetFormMapping2 newForm = new ICIPDatasetFormMapping2();
				newForm.setDataset(form.getDataset());
				newForm.setFormtemplate(form.getFormtemplate().getName());
				newForm.setOrganization(toProjectId);
				save(newForm);
			} catch (Exception e) {
				joblogger.error("Error in saving dataset : {}", form.getId());
				joblogger.error(e.getMessage());
			}
		});
		return true;
	}
}
