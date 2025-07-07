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

import java.util.List;
import java.util.stream.Collectors;

import javax.sql.rowset.serial.SerialBlob;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.icipwebeditor.model.ICIPScript;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPScriptRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPScriptService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPScriptService.
 *
 * @author icets
 */
@Service
public class ICIPScriptService implements IICIPScriptService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPScriptService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The script repository. */
	private ICIPScriptRepository scriptRepository;

	/**
	 * Instantiates a new ICIP script service.
	 *
	 * @param binaryRepository the binary repository
	 */
	public ICIPScriptService(ICIPScriptRepository binaryRepository) {
		super();
		this.scriptRepository = binaryRepository;
	}

	/**
	 * Save.
	 *
	 * @param binaryFile the binary file
	 * @return the ICIP script
	 */
	@Override
	public ICIPScript save(ICIPScript binaryFile) {
		logger.info("saving script details");
		return scriptRepository.save(binaryFile);
	}

	/**
	 * Find by name and org and file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP script
	 */
	@Override
	public ICIPScript findByNameAndOrgAndFile(String name, String org, String filename) {
		logger.info("getting script by name : {}", filename);
		return scriptRepository.findByCnameAndOrganizationAndFilename(name, org, filename);
	}

	/**
	 * Update file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @param file     the file
	 * @return the ICIP script
	 */
	@Override
	public ICIPScript updateFile(String name, String org, String filename, SerialBlob file) {
		logger.info("updating script : {}", filename);
		ICIPScript binaryFile = scriptRepository.findByCnameAndOrganizationAndFilename(name, org, filename);
		binaryFile.setFilescript(file);
		return scriptRepository.save(binaryFile);
	}

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(Marker marker, String fromProjectId, String toProjectId) {
		joblogger.info(marker, "Fetching scripts for Entity {}", fromProjectId);
		List<ICIPScript> script = scriptRepository.findByOrganization(fromProjectId);
		List<ICIPScript> toScript = script.parallelStream().map(model -> {
			model.setId(null);
			model.setOrganization(toProjectId);
			return model;
		}).collect(Collectors.toList());
		toScript.stream().forEach(model -> {
			try {
				scriptRepository.save(model);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}
		});
		return true;
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	@Override
	public void delete(String project) {
		scriptRepository.deleteByProject(project);

	}

}
