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
