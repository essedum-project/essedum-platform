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