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

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.text.ParseException;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.dataset.model.ICIPDataset;
import com.infosys.icets.icip.dataset.model.ICIPDataset2;
import com.infosys.icets.icip.dataset.model.ICIPSchemaRegistry;

import javassist.CannotCompileException;
import javassist.NotFoundException;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPDatasetService.
 *
 * @author icets
 */
public interface IICIPDatasetService {

	/**
	 * Gets the dataset.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the dataset
	 */
	ICIPDataset getDataset(String name, String org);

	/**
	 * Gets the dataset.
	 *
	 * @param id the id
	 * @return the dataset
	 */
	ICIPDataset getDataset(Integer id);

	/**
	 * Gets the dataset for experiments.
	 *
	 * @param org the org
	 * @return the dataset
	 */
	List<ICIPDataset> getDatasetForExp(String org);

	/**
	 * Save.
	 *
	 * @param idOrName    the id or name
	 * @param iCIPDataset the i CIP dataset
	 * @return the ICIP dataset
	 */
	ICIPDataset2 save(String idOrName, ICIPDataset iCIPDataset);

	/**
	 * Delete.
	 *
	 * @param name the name
	 * @param org  the org
	 */
	void delete(String name, String org);

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param projectId     the project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId, int projectId);
	
	boolean copytemplate(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId);


	/**
	 * Gets the datasets by org.
	 *
	 * @param organization the organization
	 * @return the datasets by org
	 */
	List<ICIPDataset> getDatasetsByOrg(String organization);

	/**
	 * Search datasets.
	 *
	 * @param name         the name
	 * @param organization the organization
	 * @param page         the page
	 * @param size         the size
	 * @return the list
	 */
	List<ICIPDataset> searchDatasets(String name, String organization, int page, int size);

	/**
	 * Search datasets len.
	 *
	 * @param name         the name
	 * @param organization the organization
	 * @return the long
	 */
	Long searchDatasetsLen(String name, String organization);

	/**
	 * Gets the datasets by group and org.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @return the datasets by group and org
	 */
	List<ICIPDataset> getDatasetsByGroupAndOrg(String organization, String groupName);

	/**
	 * Gets the paginated datasets by group and org.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @param search       the search
	 * @param page         the page
	 * @param size         the size
	 * @return the paginated datasets by group and org
	 */
	List<ICIPDataset> getPaginatedDatasetsByGroupAndOrg(String organization, String groupName, String search, String interfacetype, int page,
			int size);

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	boolean renameProject(String fromProjectId, String toProjectId);

	/**
	 * Gets the dataset len by group and org.
	 *
	 * @param group  the group
	 * @param org    the org
	 * @param search the search
	 * @return the dataset len by group and org
	 */
	Long getDatasetLenByGroupAndOrg(String group, String org, String search);

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	void delete(String project);

	/**
	 * Cast dynamic class.
	 *
	 * @param string the string
	 * @param val    the val
	 * @return the object
	 * @throws ParseException the parse exception
	 */
	Object castDynamicClass(String string, String val) throws ParseException;

	/**
	 * Process script.
	 *
	 * @param jsonArray the json array
	 * @param script    the script
	 * @return the JSON array
	 * @throws NotFoundException         the not found exception
	 * @throws CannotCompileException    the cannot compile exception
	 * @throws IOException               Signals that an I/O exception has occurred.
	 * @throws IllegalAccessException    the illegal access exception
	 * @throws InvocationTargetException the invocation target exception
	 * @throws NoSuchMethodException     the no such method exception
	 */
	JSONArray processScript(JSONArray jsonArray, JSONArray script) throws NotFoundException, CannotCompileException,
			IOException, IllegalAccessException, InvocationTargetException, NoSuchMethodException;

	/**
	 * Gets the datasets by org and datasource.
	 *
	 * @param org        the org
	 * @param datasource the datasource
	 * @return the datasets by org and datasource
	 */
	List<ICIPDataset2> getDatasetsByOrgAndDatasource(String org, String datasource);

	/**
	 * Update exp status.
	 *
	 * @param datasetId the dataset id
	 * @param status    the status
	 * @return the ICIP dataset
	 */
	ICIPDataset updateExpStatus(Integer datasetId, String status);

	/**
	 * Gets the dataset.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the dataset
	 */
	ICIPDataset2 getDatasetObject(String name, String org);

	/**
	 * Gets the dataset 2.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the dataset 2
	 */
	ICIPDataset2 getDataset2(String name, String org);
	
	ICIPDataset2 getDatasetByOrgAndAlias2(String datasetName, String org);

    ICIPDataset getDatasetByOrgAndAlias(String datasetName, String org);
	
	/**
	 * Save.
	 *
	 * @param idOrName the id or name
	 * @param iCIPDataset2Save the i CIP dataset 2 save
	 * @param skip the skip
	 * @return the ICIP dataset 2
	 */
	ICIPDataset2 save(String idOrName, ICIPDataset iCIPDataset2Save, boolean skip);

	/**
	 * Save.
	 *
	 * @param idOrName         the id or name
	 * @param iCIPDataset2Save the i CIP dataset 2 save
	 * @param logger           the logger
	 * @param marker           the marker
	 * @param datasetProjectId the dataset project id
	 * @param skip the skip
	 * @return the ICIP dataset
	 */
	ICIPDataset2 save(String idOrName, ICIPDataset iCIPDataset2Save, Logger logger, Marker marker, int datasetProjectId,
			boolean skip);

	/**
	 * Creates the name.
	 *
	 * @param org the org
	 * @param alias the alias
	 * @return the string
	 */
	String createName(String org, String alias);

	/**
	 * Gets the name and alias.
	 *
	 * @param group the group
	 * @param org the org
	 * @return the name and alias
	 */
	List<NameAndAliasDTO> getNameAndAlias(String group, String org);

	/**
	 * Gets the names by org and datasource alias.
	 *
	 * @param org the org
	 * @param datasource the datasource
	 * @return the names by org and datasource alias
	 */
	List<NameAndAliasDTO> getNamesByOrgAndDatasourceAlias(String org, String datasource);

	/**
	 * Copy selected.
	 *
	 * @param marker           the marker
	 * @param fromProjectId    the from project id
	 * @param toProjectId      the to project id
	 * @param datasetProjectId the dataset project id
	 * @param datasets         the datasets
	 * @param toDatasource the to datasource
	 * @return true, if successful
	 */
	boolean copySelected(Marker marker, String fromProjectId, String toProjectId, int datasetProjectId,
			List<String> datasets, String toDatasource);

	/**
	 * Gets the views by name and org.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the views by name and org
	 */
	String getViewsByNameAndOrg(String name, String org);

	/**
	 * Save views.
	 *
	 * @param views the views
	 * @param datasetName the dataset name
	 * @param projectName the project name
	 * @return the string
	 */
	String saveViews(String views, String datasetName, String projectName);

	/**
	 * Save archival config.
	 *
	 * @param id the id
	 * @param config the config
	 * @return the ICIP dataset 2
	 * @throws LeapException the leap exception
	 */
	ICIPDataset2 saveArchivalConfig(int id, String config) throws LeapException;

	/**
	 * Gets the dataset by dashboard.
	 *
	 * @param dashboardId the dashboard id
	 * @return the dataset by dashboard
	 */
	ICIPDataset getDatasetByDashboard(Integer dashboardId);

	/**
	 * @param schemaAlias
	 * @param projectName
	 * @return
	 * @throws LeapException
	 */
	List<ICIPDataset> getDatasetBySchemaAndOrganization(ICIPSchemaRegistry schema, String projectName) ;
	
	
	ICIPDataset2 save(ICIPDataset iCIPDataset);

	String generateFormTemplate(JSONObject templateDetails, String datasetName, String org);

	List<ICIPDataset> getDatasetsByOrgandPage(String project,String search, Pageable paginate, Boolean isTemplate);

	Long getAllDatasetsCountByOrganisation(String project,String query, Boolean isTemplate);
	
	List<ICIPDataset> getAllDatasetsByDatasource(String project, String datasource, String search, Pageable paginate);

	Long getAllDatasetsCountByOrganisationAndDatasource(String project,String query, String datasource);

	List<ICIPDataset> getDatasetsByOrgandViews(String project, String views);	

	List<String> listIndexNames(String org);

	List<ICIPDataset> getDoc(String docViewType, String org, Pageable paginate);

	Long getDocCount(String docViewType, String org);
}
