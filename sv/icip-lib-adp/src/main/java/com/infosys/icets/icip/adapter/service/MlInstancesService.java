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
package com.infosys.icets.icip.adapter.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.icip.dataset.model.MlInstance;

/**
 * The Interface MlInstancesService.
 *
 * @author icets
 */
public interface MlInstancesService {

	MlInstance save(MlInstance mlInstance);

	MlInstance updateMlInstance(MlInstance mlInstance);

	MlInstance getMlInstanceByNameAndOrganization(String name, String org);

	List<MlInstance> getMlInstanceByOrganization(String org,String adapterName, String connection, String query, Pageable pageable);
	
	Long getMlInstanceCountByOrganization(String org,String adapterName, String connection, String query);
	
	List<String> getMlInstanceNamesByAdapterNameAndOrganization(String adapterName,String org);

	Map<String,String> deleteMlInstanceByNameAndOrganization(String name, String org);

	Map<String,Object> getFiltersByOrganization(String org);

	List<String> getMlInstanceNamesByOrganization(String org);

	Map<String, Object> getMethodsByInstanceAndOrganization(String instanceName, String org);

	MlInstance getMlInstanceBySpectemplatedomainnameAndOrganizationAndOrderPriority(String spectemplatedomainname,
			String org, Integer orderPriority);

	List<MlInstance> getMlInstanceBySpecTemDomNameAndOrg(String spectemplatedomainname, String org);

	List<MlInstance> changeOrderPriorityBySpecTemDomNameAndInstancNameAndOrg(String spectemplatedomainname,
			String instanceName, Integer orderPriority, String org);

}
