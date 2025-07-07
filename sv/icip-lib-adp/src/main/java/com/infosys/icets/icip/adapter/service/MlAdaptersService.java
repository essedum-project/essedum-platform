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

import com.infosys.icets.icip.dataset.model.MlAdapters;

/**
 * The Interface MlAdaptersService.
 *
 * @author icets
 */
public interface MlAdaptersService {

	MlAdapters save(MlAdapters mlAdapters);

	MlAdapters updateMlAdapter(MlAdapters mlAdapters);

	MlAdapters getMlAdapteByNameAndOrganization(String name, String org);

	List<MlAdapters> getMlAdaptesByOrganization(String org);

	Map<String, String> deleteMlAdapteByNameAndOrganization(String name, String org);

	MlAdapters updateAPISpec(MlAdapters mlAdapters);

	Map<String, Object> getFiltersByOrganization(String org);

	List<MlAdapters> getMlAdaptersBySpecTemplateDomainNameAndOrg(String spectemplatedomainname, String org);

	List<String> getAdapterNamesByOrganization(String org);

	//implement pagenition count and list
	Long getAdapterImplementationCount(String organization,String category,String spec,String connection,String query);
	
	Page<MlAdapters> getAdapterImplementation(String organization,String category,String spec,String connection,String query, Pageable pageable);
}
