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

package com.infosys.icets.icip.icipmodelserver.service;

import java.io.IOException;
import java.net.UnknownHostException;
import java.sql.Blob;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

import org.slf4j.Marker;
import org.springframework.web.multipart.MultipartFile;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.infosys.icets.icip.icipmodelserver.model.ICIPModelServers;
import com.infosys.icets.icip.icipmodelserver.model.ICIPPipelineModel;
import com.infosys.icets.icip.icipmodelserver.model.dto.ICIPPipelineModelDTO;

// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPPipelineModelService.
 *
 * @author icets
 */
public interface IICIPPipelineModelService {

	/**
	 * Gets the ICIP pipeline model 2.
	 *
	 * @param modelname    the modelname
	 * @param organization the organization
	 * @return the ICIP pipeline model 2
	 */
	public ICIPPipelineModel getICIPPipelineModel(String modelname, String organization);

	/**
	 * Gets the pipeline models.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the pipeline models
	 */
	List<ICIPPipelineModel> getPipelineModels(String org, int page, int size);

	/**
	 * Gets the pipeline models len.
	 *
	 * @param org the org
	 * @return the pipeline models len
	 */
	Long getPipelineModelsLen(String org);

	/**
	 * Gets the pipeline models by search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @param page   the page
	 * @param size   the size
	 * @return the pipeline models
	 * @throws LeapException the leap exception
	 */
	List<ICIPPipelineModel> getPipelineModelsBySearch(String org, String search, int page, int size)
			throws LeapException;

	/**
	 * Gets the pipeline models len by search.
	 *
	 * @param org    the org
	 * @param search the search
	 * @return the pipeline models len
	 */
	Long getPipelineModelsLenBySearch(String org, String search);

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean renameProject(String fromProjectId, String toProjectId);

	/**
	 * Copy.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean copy(String fromProjectId, String toProjectId);

	/**
	 * Save.
	 *
	 * @param pipelineModel the pipeline model
	 * @return the ICIP pipeline model
	 */
	ICIPPipelineModel save(ICIPPipelineModel pipelineModel);

	/**
	 * Expose pipeline as model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @return the ICIP pipeline model
	 * @throws LeapException the leap exception
	 * @throws SQLException  the SQL exception
	 */
	ICIPPipelineModel exposePipelineAsModel(ICIPPipelineModelDTO pipelineModelDTO) throws LeapException, SQLException;

	/**
	 * Initialize value in pipeline model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @param pipelineModel    the pipeline model
	 * @return the ICIP pipeline model
	 * @throws SQLException the SQL exception
	 */
	ICIPPipelineModel initializeValueInPipelineModel(ICIPPipelineModelDTO pipelineModelDTO,
			ICIPPipelineModel pipelineModel) throws SQLException;

	/**
	 * Delete by id.
	 *
	 * @param id the id
	 */
	void deleteById(int id);

	/**
	 * Update status by id.
	 *
	 * @param id     the id
	 * @param status the status
	 * @return the ICIP pipeline model
	 */
	ICIPPipelineModel updateStatusById(Integer id, Integer status);

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP pipeline model
	 */
	ICIPPipelineModel findById(Integer id);

	/**
	 * Adds the model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @return the ICIP pipeline model
	 * @throws SQLException the SQL exception
	 */
	ICIPPipelineModel addModel(ICIPPipelineModelDTO pipelineModelDTO) throws SQLException;

	/**
	 * Run pipeline as model.
	 *
	 * @param org    the org
	 * @param params the params
	 * @param name   the name
	 * @return the string
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	String runPipelineAsModel(String org, String params, String name) throws IOException;

	/**
	 * Find by status.
	 *
	 * @param status the status
	 * @return the list
	 */
	List<ICIPPipelineModel> findByStatus(Integer status);

	/**
	 * Run pipeline model.
	 *
	 * @param fileid the fileid
	 * @param params the params
	 * @return the string
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException   the execution exception
	 * @throws UnknownHostException the unknown host exception
	 * @throws TimeoutException     the timeout exception
	 */
	String runPipelineModel(String fileid, String params)
			throws InterruptedException, ExecutionException, UnknownHostException, TimeoutException;

	/**
	 * Find by status and model server.
	 *
	 * @param status      the status
	 * @param modelserver the modelserver
	 * @return the list
	 */
	List<ICIPPipelineModel> findByStatusAndModelServer(Integer status, Integer modelserver);

	/**
	 * Find by file id.
	 *
	 * @param fileid the fileid
	 * @return the ICIP pipeline model
	 */
	ICIPPipelineModel findByFileId(String fileid);

	/**
	 * Gets the string from blob.
	 *
	 * @param blob the blob
	 * @return the string from blob
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 */
	List<String> getStringFromBlob(Blob blob) throws IOException, SQLException;

	/**
	 * Check bootstrap.
	 *
	 * @param pipelineModel the pipeline model
	 * @return the string
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException   the execution exception
	 * @throws UnknownHostException the unknown host exception
	 * @throws TimeoutException     the timeout exception
	 */
	String checkBootstrap(ICIPPipelineModel pipelineModel)
			throws InterruptedException, ExecutionException, UnknownHostException, TimeoutException;

	/**
	 * Adds the kubeflow model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @return the ICIP pipeline model
	 * @throws SQLException the SQL exception
	 */
	ICIPPipelineModel addKubeflowModel(ICIPPipelineModelDTO pipelineModelDTO) throws SQLException;

	/**
	 * Update deploy status.
	 *
	 * @param fileid             the fileid
	 * @param authserviceSession the authservice session
	 * @return the string[]
	 * @throws InterruptedException the interrupted exception
	 * @throws ExecutionException   the execution exception
	 * @throws TimeoutException     the timeout exception
	 */
	String[] updateDeployStatus(String fileid, String authserviceSession)
			throws InterruptedException, ExecutionException, TimeoutException;

	/**
	 * Adds the hosted model.
	 *
	 * @param pipelineModelDTO the pipeline model DTO
	 * @return the ICIP pipeline model
	 * @throws LeapException the leap exception
	 * @throws SQLException  the SQL exception
	 */
	ICIPPipelineModel addHostedModel(ICIPPipelineModelDTO pipelineModelDTO) throws LeapException, SQLException;

	/**
	 * Delete file.
	 *
	 * @param url the url
	 * @param accessToken the access token
	 */
	void deleteFile(String url, String accessToken);

	/**
	 * Delete model from model server.
	 *
	 * @param url the url
	 */
	void deleteModelFromModelServer(String url);

	/**
	 * Upload model.
	 *
	 * @param multipartfile the multipartfile
	 * @param fileid the fileid
	 * @param metadata the metadata
	 * @param replace the replace
	 * @param org the org
	 * @param folder the folder
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws Exception the exception
	 */
	void uploadModel(MultipartFile multipartfile, String fileid, ICIPChunkMetaData metadata, boolean replace,
			String org, String folder) throws IOException, Exception;

	/**
	 * Find by status and org.
	 *
	 * @param status the status
	 * @param org the org
	 * @return the list
	 */
	List<ICIPPipelineModel> findByStatusAndOrg(Integer status, String org);

	/**
	 * Find running or failed uploads.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPPipelineModel> findRunningOrFailedUploads(String org);

	/**
	 * Find by model server.
	 *
	 * @param modelserver the modelserver
	 * @return the list
	 */
	List<ICIPPipelineModel> findByModelServer(Integer modelserver);

	/**
	 * Call bootstrap.
	 *
	 * @param pipelineModel the pipeline model
	 * @param modelServer the model server
	 * @param marker the marker
	 * @throws Exception the exception
	 */
	void callBootstrap(ICIPPipelineModel pipelineModel, ICIPModelServers modelServer, Marker marker) throws Exception;

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	public List<NameAndAliasDTO> getNameAndAlias(String group, String org);

	/**
	 * Deploy.
	 *
	 * @param fileid             the fileid
	 * @param authserviceSession the authservice session
	 * @return the string
	 * @throws Exception the exception
	 */
	String deploy(String fileid, String authserviceSession) throws Exception;

	/**
	 * Call fail check.
	 *
	 * @param pipelineModel the pipeline model
	 * @param marker the marker
	 * @return the ICIP pipeline model
	 * @throws Exception the exception
	 */
	ICIPPipelineModel callFailCheck(ICIPPipelineModel pipelineModel, Marker marker) throws Exception;

	public List<ICIPPipelineModel> getPipelineModelsByOrg(String org);
}
