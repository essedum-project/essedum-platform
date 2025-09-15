package com.lfn.icip.dataset.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.ICIPSchemaForm;
import com.lfn.icip.dataset.model.ICIPSchemaRegistry;
import com.lfn.icip.dataset.repository.ICIPSchemaFormRepository;
import com.lfn.icip.dataset.service.IICIPSchemaFormService;

@Service
@Transactional
public class ICIPSchemaFormService implements IICIPSchemaFormService {
	
	@Autowired
	private ICIPSchemaFormRepository schemaFormRepository;
	
	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);
	
	/**
	 * Fetch schema form template.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the string
	 */
	
	@Override
	public List<ICIPSchemaForm> fetchSchemaForm(String schema, String org) {
		return schemaFormRepository.getBySchemanameAndOrganization(schema, org);
	}

//	@Override
//	public ICIPSchemaForm getschemabySchemaNameAndOrg(String schema, String org) {
//		return schemaFormRepository.findBySchemanameAndOrganization(schema, org);
//	}

	@Override
	public void delete(Integer id) {
		schemaFormRepository.deleteById(id);
		
	}


	@Override
	public ICIPSchemaForm save(ICIPSchemaForm schemaForm) {
		return schemaFormRepository.save(schemaForm);
	}


	@Override
	public ICIPSchemaForm fetchSchemaFormTemplate(String templatename, String schema, String org) {
		return schemaFormRepository.getByNameAndSchemanameAndOrganization(templatename,schema,org);
	}
	
	@Override
	public boolean copy(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId) {
		List<ICIPSchemaForm> forms = schemaFormRepository.findByOrganization(fromProjectId);
		List<ICIPSchemaForm> toForms = forms.parallelStream().map(form -> {
			form.setId(null);
			form.setOrganization(toProjectId);
			return form;
		}).collect(Collectors.toList());
		toForms.stream().forEach(form -> {
			ICIPSchemaForm schemaform = fetchSchemaFormTemplate(form.getFormtemplate(),form.getSchemaname(), form.getOrganization());
			String id = null;
			if (schemaform != null) {
				form.setId(schemaform.getId());
				id = schemaform.getId().toString();
			}
			try {
				save(form);
			} catch (Exception e) {
				joblogger.error("Error in saving m schemaform {}", form.getName());
				joblogger.error(e.getMessage());
			}
		});
		return true;
	}


	@Override
	public ICIPSchemaForm fetchSchemaFormTemplateByNameAndOrg(String templatename, String organization) {
		return schemaFormRepository.getByNameAndOrganization(templatename,organization);
	}

}
