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
