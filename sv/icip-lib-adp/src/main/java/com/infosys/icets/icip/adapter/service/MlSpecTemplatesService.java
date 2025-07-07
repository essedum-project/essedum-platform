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

import com.infosys.icets.icip.dataset.model.MlSpecTemplates;
import com.infosys.icets.icip.dataset.model.MlSpecTemplates2;

/**
 * The Interface MlSpecTemplatesService.
 *
 * @author icets
 */
public interface MlSpecTemplatesService {

	MlSpecTemplates save(MlSpecTemplates mlSpecTemplates);
	
	MlSpecTemplates getMlSpecTemplateByDomainNameAndOrganization(String domainName,String organization);
    
	MlSpecTemplates updateMlSpecTemplate(MlSpecTemplates mlSpecTemplates);
	Map<String, String> delete(String domainName,String organization);
	
	List<MlSpecTemplates2> getAllMlSpecTemplates(String org);

	Map<String, Object> getFiltersByOrganization(String org);
	
	List<String> getSpecTemplatesNamesByOrganization(String org);
	
	List<MlSpecTemplates2> getMlSpecTemplatesPageWise(String org, String capability, String page, String size,
			String query);

	Long getMlSpecTemplatesCount(String org, String capability, String query);

}
