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
/**
 * @ 2018 - 2019 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
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

