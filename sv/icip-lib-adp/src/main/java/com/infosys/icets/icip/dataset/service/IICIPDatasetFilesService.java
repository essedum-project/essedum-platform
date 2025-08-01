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

package com.infosys.icets.icip.dataset.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;

import javax.script.ScriptException;

import org.springframework.web.multipart.MultipartFile;

import com.infosys.icets.icip.dataset.model.ICIPDatasetFiles;
import com.infosys.icets.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDatasetFilesService.
 *
 * @author icets
 */
public interface IICIPDatasetFilesService {

	/**
	 * Save.
	 *
	 * @param datasetFile the dataset file
	 * @return the ICIP dataset files
	 */
	ICIPDatasetFiles save(ICIPDatasetFiles datasetFile);

	/**
	 * Find by name and org.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP dataset files
	 */
	ICIPDatasetFiles findByNameAndOrgAndFilename(String name, String org, String filename);

	/**
	 * Gets the headers.
	 *
	 * @param path the path
	 * @return the headers
	 * @throws Exception the exception
	 */
	String getHeaders(Path path) throws Exception;

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP dataset files
	 */
	ICIPDatasetFiles findById(String id);

	/**
	 * Gets the files.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the files
	 */
	List<ICIPDatasetFiles> getFiles(String name, String org);

	List<ICIPDatasetFiles> getTemplateFiles(String org);
	/**
	 * Delete.
	 *
	 * @param icipDatasetFiles the icip dataset files
	 */
	void delete(ICIPDatasetFiles icipDatasetFiles);

	/**
	 * Save file.
	 *
	 * @param file     the file
	 * @param metadata the metadata
	 * @param org the org
	 * @param fileid the fileid
	 * @return the path
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws Exception the exception
	 */
	HashMap<String, Object> saveFile(MultipartFile file, ICIPChunkMetaData metadata, String org, String fileid, int projectId, String type)
			throws IOException, Exception;
	
	HashMap<String, Object> saveFile(MultipartFile file, ICIPChunkMetaData metadata, String org, String fileid,int fileSize,String fileType, int projectId)
			throws IOException, Exception;

	
	void copyFileFromServer(ICIPDatasetFiles datasetFile) throws Exception;

	String getJsonHeaders(Path path, String query) throws FileNotFoundException, IOException, ScriptException;

}