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
package com.infosys.icets.icip.dataset.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.dataset.model.MlSpecTemplates;
import com.infosys.icets.icip.dataset.model.MlSpecTemplates2;

/**
 * Spring Data JPA repository for the MlSpecTemplates entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface MlSpecTemplatesRepository extends JpaRepository<MlSpecTemplates, Integer> {

	List<MlSpecTemplates> getMlSpecTemplateByDomainnameAndOrganization(String domainName,String organization);

	List<MlSpecTemplates2> getAllMlSpecTemplates(String org);

	List<MlSpecTemplates> getMlSpecTemplateByOrganization(String org);
	
	List<String> getSpecTemplatesNamesByOrganization(String org);
	
	List<MlSpecTemplates2> getAllMlSpecTemplatesByOrganization(String org, Pageable paginate);

	Long countByOrganization(String org);
	
	List<MlSpecTemplates2> getAllMlSpecTemplatesByOrganizationAndDomainname(String org, String domainname,
			Pageable paginate);

	List<MlSpecTemplates2> getMlSpecTemplatesByOrganizationAndCapability(String org, String capability);

	// Count templates by organization and domain name (for query filter)
	Long countByOrganizationAndDomainnameContainingIgnoreCase(String org, String domainname);

	// Count templates by organization and capability
	Long countByOrganizationAndCapability(String org, String capability);

	// Count templates by organization, domain name, and list of capabilities
	Long countByOrganizationAndDomainnameContainingIgnoreCaseAndCapabilityIn(String org, String query,
			List<String> capabilities);

}
