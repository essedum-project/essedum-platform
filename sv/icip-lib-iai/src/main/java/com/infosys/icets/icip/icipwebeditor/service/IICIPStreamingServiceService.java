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

package com.infosys.icets.icip.icipwebeditor.service;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.icip.icipwebeditor.model.ICIPStreamingServices;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices2DTO;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPStreamingServices3DTO;
import com.infosys.icets.icip.icipwebeditor.util.ICIPPageRequestByExample;
import com.infosys.icets.icip.icipwebeditor.util.ICIPPageResponse;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPStreamingServiceService.
 *
 * @author icets
 */
public interface IICIPStreamingServiceService {

	/**
	 * Gets the streaming services.
	 *
	 * @param streamingServices the streaming services
	 * @return the streaming services
	 */
	public ICIPStreamingServices getStreamingServices(ICIPStreamingServices streamingServices);

	/**
	 * Find one.
	 *
	 * @param id the id
	 * @return the ICIP streaming services
	 */
	public ICIPStreamingServices findOne(Integer id);

	/**
	 * Gets the ICIP streaming services.
	 *
	 * @param name    the name
	 * @param project the project
	 * @return the ICIP streaming services
	 */
	public ICIPStreamingServices getICIPStreamingServices(String name, String project);

	/**
	 * Gets the ICIP streaming services refactored.
	 *
	 * @param name the name
	 * @param project the project
	 * @return the ICIP streaming services refactored
	 */
	public ICIPStreamingServices getICIPStreamingServicesRefactored(String name, String project);

	/**
	 * Save.
	 *
	 * @param streamingServices the streaming services
	 * @return the ICIP streaming services
	 */
	public ICIPStreamingServices save(ICIPStreamingServices streamingServices);

	/**
	 * Save.
	 *
	 * @param streamingServices the streaming services
	 * @param logger            the logger
	 * @param marker            the marker
	 * @return the ICIP streaming services
	 */
	public ICIPStreamingServices save(ICIPStreamingServices streamingServices, Logger logger, Marker marker);

	/**
	 * Update.
	 *
	 * @param streamingServices the streaming services
	 * @return the ICIP streaming services
	 * @throws SQLException the SQL exception
	 * @throws IOException 
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	public ICIPStreamingServices update(ICIPStreamingServices streamingServices) throws SQLException, InvalidRemoteException, TransportException, GitAPIException, IOException;

	/**
	 * Update.
	 *
	 * @param streamingServices the streaming services
	 * @param logger            the logger
	 * @param marker            the marker
	 * @return the ICIP streaming services
	 * @throws SQLException the SQL exception
	 * @throws IOException 
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	public ICIPStreamingServices update(ICIPStreamingServices streamingServices, Logger logger, Marker marker)
			throws SQLException, InvalidRemoteException, TransportException, GitAPIException, IOException;

	/**
	 * Delete.
	 *
	 * @param id the id
	 * @throws SQLException the SQL exception
	 * @throws GitAPIException 
	 * @throws IOException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	public void delete(Integer id) throws SQLException, InvalidRemoteException, TransportException, IOException, GitAPIException;

	/**
	 * Find by organization.
	 *
	 * @param fromProjectId the from project id
	 * @return the list
	 */
	public List<NameAndAliasDTO> findByOrganization(String fromProjectId);

	public List<NameAndAliasDTO> findByInterfacetypeAndOrganization(String template,String fromProjectId);

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
	 * Delete.
	 *
	 * @param project the project
	 */
	public void delete(String project);

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	public List<NameAndAliasDTO> getNameAndAlias(String group, String org);
	
	/**
	 * Gets the all.
	 *
	 * @param req the req
	 * @return the all
	 */
	ICIPPageResponse<ICIPStreamingServices2DTO> getAll(ICIPPageRequestByExample<ICIPStreamingServices2DTO> req);

	/**
	 * Gets the streaming services by group and org.
	 *
	 * @param group the group
	 * @param org   the org
	 * @param page  the page
	 * @param size  the size
	 * @return the streaming services by group and org
	 */
	List<ICIPStreamingServices3DTO> getStreamingServicesByGroupAndOrg(String group, String org, int page,
			int size);

	/**
	 * Gets the streaming services len by group and org.
	 *
	 * @param group the group
	 * @param org   the org
	 * @return the streaming services len by group and org
	 */
	Long getStreamingServicesLenByGroupAndOrg(String group, String org);

	/**
	 * Gets the streaming services by group and org and search.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @param page   the page
	 * @param size   the size
	 * @return the streaming services by group and org and search
	 */
	List<ICIPStreamingServices3DTO> getStreamingServicesByGroupAndOrgAndSearch(String group, String org,
			String search, int page, int size);

	/**
	 * Gets the streaming services len by group and org and search.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the streaming services len by group and org and search
	 */
	Long getStreamingServicesLenByGroupAndOrgAndSearch(String group, String org, String search);

	/**
	 * Gets the all pipelines.
	 *
	 * @return the all pipelines
	 */
	List<ICIPStreamingServices2DTO> getAllPipelines();

	/**
	 * Gets the all pipelines by org.
	 *
	 * @param org the org
	 * @return the all pipelines by org
	 */
	List<ICIPStreamingServices2DTO> getAllPipelinesByOrg(String org);

	/**
	 * Gets the all pipelines by type.
	 *
	 * @param type the type
	 * @param org  the org
	 * @return the all pipelines by type
	 */
	List<ICIPStreamingServices2DTO> getAllPipelinesByType(String type, String org, String interfacetype);

	/**
	 * Gets the all pipeline names by org.
	 *
	 * @param org the org
	 * @return the all pipeline names by org
	 */
	List<NameAndAliasDTO> getAllPipelineNamesByOrg(String org);

	/**
	 * Gets the all pipelines by type and group.
	 *
	 * @param type   the type
	 * @param org    the org
	 * @param group  the group
	 * @param search the search
	 * @return the all pipelines by type and group
	 */
	List<ICIPStreamingServices2DTO> getAllPipelinesByTypeAndGroup(String type, String org, String group,
			String search);
	
	ICIPStreamingServices findbyNameAndOrganization(String name,String org);

	public String savePipelineJson(String name, String org, String string);

	public JSONObject getGeneratedScript(String name, String org);
	
	public JSONObject getAllScripts(String name, String org);

	public List<ICIPStreamingServices3DTO> getStreamingServicesByGroupAndOrgAndTemplate(String group, String org, String interfacetype,
			int parseInt, int parseInt2);

	List<String> getPipelinesTypeByOrganization(String org);

	public List<ICIPStreamingServices2DTO> getAllPipelinesByTypeAndOrg(String project, Pageable paginate,String query,
			List<Integer>  tags,	String orderBy, String type, String interfacetype);

	public Long getPipelinesCountByTypeAndOrg(String project, String query, List<Integer> tagList, String orderBy,
			String type, String interfacetype);

	public ICIPStreamingServices getTemplateByName(String name, String org);

	List<ICIPStreamingServices2DTO> getAllTemplatesByTypeAndOrg(String project, Pageable paginate, String query,
			String orderBy, String type);

	Long getTemplatesCountByTypeAndOrg(String project, String query, String orderBy, String type);
	
	public List<ICIPStreamingServices> getPipelinesByAliasAndOrg(String alias, String org);
	
	public String getICIPStreamingServicesByAlias(String alias, String org);

	List<ICIPStreamingServices2DTO> getAllPipelinesByInterfacetype(String type, String org);

	public List<ICIPStreamingServices> getAllByOrganization(String source);

	List<ICIPStreamingServices2DTO> getPipelineByNameAndOrg(String name, String org);
}
