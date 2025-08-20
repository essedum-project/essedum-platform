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

package com.lfn.icip.icipwebeditor.service;

import javax.sql.rowset.serial.SerialBlob;

import org.slf4j.Marker;

import com.lfn.icip.icipwebeditor.model.ICIPScript;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPScriptService.
 *
 * @author essedum
 */
public interface IICIPScriptService {

	/**
	 * Find by name and org and file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP script
	 */
	ICIPScript findByNameAndOrgAndFile(String name, String org, String filename);

	/**
	 * Save.
	 *
	 * @param binaryFile the binary file
	 * @return the ICIP script
	 */
	ICIPScript save(ICIPScript binaryFile);

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId);

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	void delete(String project);

	/**
	 * Update file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @param file     the file
	 * @return the ICIP script
	 */
	ICIPScript updateFile(String name, String org, String filename, SerialBlob file);
}
