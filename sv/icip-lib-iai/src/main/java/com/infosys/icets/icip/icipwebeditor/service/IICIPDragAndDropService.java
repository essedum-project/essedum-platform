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
package com.infosys.icets.icip.icipwebeditor.service;

import javax.sql.rowset.serial.SerialBlob;

import com.infosys.icets.icip.icipwebeditor.model.ICIPDragAndDrop;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDragAndDropService.
 *
 * @author icets
 */
public interface IICIPDragAndDropService {

	/**
	 * Find by name and org and file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP drag and drop
	 */
	ICIPDragAndDrop findByNameAndOrgAndFile(String name, String org, String filename);

	/**
	 * Save.
	 *
	 * @param binaryFile the binary file
	 * @return the ICIP drag and drop
	 */
	ICIPDragAndDrop save(ICIPDragAndDrop binaryFile);

	/**
	 * Update file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @param file     the file
	 * @return the ICIP drag and drop
	 */
	ICIPDragAndDrop updateFile(String name, String org, String filename, SerialBlob file);
}
