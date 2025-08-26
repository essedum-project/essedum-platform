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
import com.infosys.icets.icip.icipwebeditor.model.ICIPBinaryFiles;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPBinaryFilesRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPBinaryFilesService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPBinaryFilesService.
 *
 * @author icets
 */
@Service
public class ICIPBinaryFilesService implements IICIPBinaryFilesService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPBinaryFilesService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The binary repository. */
	private ICIPBinaryFilesRepository binaryRepository;

	/**
	 * Instantiates a new ICIP binary files service.
	 *
	 * @param binaryRepository the binary repository
	 */
	public ICIPBinaryFilesService(ICIPBinaryFilesRepository binaryRepository) {
		super();
		this.binaryRepository = binaryRepository;
	}

	/**
	 * Save.
	 *
	 * @param binaryFile the binary file
	 * @return the ICIP binary files
	 */
	@Override
	public ICIPBinaryFiles save(ICIPBinaryFiles binaryFile) {
		logger.info("saving binary-file details");
		return binaryRepository.save(binaryFile);
	}

	/**
	 * Find by name and org and file.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP binary files
	 */
	@Override
	public ICIPBinaryFiles findByNameAndOrg(String name, String org) {
		logger.info("getting binary-file by name : {}", name);
		return binaryRepository.findByCnameAndOrganization(name, org);
	}

	/**
	 * Delete by name and org.
	 *
	 * @param name the name
	 * @param org  the org
	 */
	@Override
	public void deleteByNameAndOrg(String name, String org) {
		logger.info("deleting binary-file");
		ICIPBinaryFiles fetched = binaryRepository.findByCnameAndOrganization(name, org);
		if (fetched != null) {
			binaryRepository.deleteById(fetched.getId());
		}
	}

	/**
	 * Update file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @param file     the file
	 * @return the ICIP binary files
	 */
	@Override
	public ICIPBinaryFiles updateFile(String name, String org, String filename, SerialBlob file) {
		logger.info("updating binary-file : {}", filename);
		ICIPBinaryFiles binaryFile = binaryRepository.findByCnameAndOrganizationAndFilename(name, org, filename);
		binaryFile.setFilescript(file);
		return binaryRepository.save(binaryFile);
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
		joblogger.info(marker, "Fetching events for Entity {}", fromProjectId);
		List<ICIPBinaryFiles> event = binaryRepository.findByOrganization(fromProjectId);
		List<ICIPBinaryFiles> toMod = event.parallelStream().map(model -> {
			model.setId(null);
			model.setOrganization(toProjectId);
			return model;
		}).collect(Collectors.toList());
		toMod.stream().forEach(model -> {
			try {
				binaryRepository.save(model);
			} catch (DataIntegrityViolationException e) {
				logger.error("Error in saving BinaryFiles Service ");
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
		binaryRepository.deleteByProject(project);
	}
	
	@Override
	public List<ICIPBinaryFiles> findByOrg(String org) {
		return binaryRepository.findByOrganization(org);
	}

}
