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

import javax.sql.rowset.serial.SerialBlob;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.infosys.icets.icip.icipwebeditor.model.ICIPDragAndDrop;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPDragAndDropRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPDragAndDropService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPDragAndDropService.
 *
 * @author icets
 */
@Service
public class ICIPDragAndDropService implements IICIPDragAndDropService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPDragAndDropService.class);

	/** The drag and drop repository. */
	private ICIPDragAndDropRepository dragAndDropRepository;

	/**
	 * Instantiates a new ICIP drag and drop service.
	 *
	 * @param dragAndDropRepository the drag and drop repository
	 */
	public ICIPDragAndDropService(ICIPDragAndDropRepository dragAndDropRepository) {
		super();
		this.dragAndDropRepository = dragAndDropRepository;
	}

	/**
	 * Save.
	 *
	 * @param binaryFile the binary file
	 * @return the ICIP drag and drop
	 */
	@Override
	public ICIPDragAndDrop save(ICIPDragAndDrop binaryFile) {
		logger.info("saving script details");
		return dragAndDropRepository.save(binaryFile);
	}

	/**
	 * Find by name and org and file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP drag and drop
	 */
	@Override
	public ICIPDragAndDrop findByNameAndOrgAndFile(String name, String org, String filename) {
		logger.info("getting script by name : {}", filename);
		return dragAndDropRepository.findByCnameAndOrganizationAndFilename(name, org, filename);
	}

	/**
	 * Update file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @param file     the file
	 * @return the ICIP drag and drop
	 */
	@Override
	public ICIPDragAndDrop updateFile(String name, String org, String filename, SerialBlob file) {
		logger.info("updating script : {}", filename);
		ICIPDragAndDrop binaryFile = dragAndDropRepository.findByCnameAndOrganizationAndFilename(name, org, filename);
		binaryFile.setFilescript(file);
		return dragAndDropRepository.save(binaryFile);
	}

}
