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

import java.util.List;

import com.infosys.icets.icip.dataset.model.ICIPPartialDataset;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPPartialDatasetService.
 *
 * @author icets
 */
public interface IICIPPartialDatasetService  {
	
	/**
	 * Gets the datasets by org.
	 *
	 * @param organization the organization
	 * @return the datasets by org
	 */
	List<ICIPPartialDataset> getDatasetsByOrg(String organization);
	
	/**
	 * Gets the datasets by group and org.
	 *
	 * @param organization the organization
	 * @param groupName the group name
	 * @return the datasets by group and org
	 */
	List<ICIPPartialDataset> getDatasetsByGroupAndOrg(String organization, String groupName);
	
	/**
	 * Gets the datasets by org and datasource.
	 *
	 * @param organization the organization
	 * @param datasource the datasource
	 * @return the datasets by org and datasource
	 */
	List<ICIPPartialDataset> getDatasetsByOrgAndDatasource(String organization, String datasource);
}

