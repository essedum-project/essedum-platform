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
