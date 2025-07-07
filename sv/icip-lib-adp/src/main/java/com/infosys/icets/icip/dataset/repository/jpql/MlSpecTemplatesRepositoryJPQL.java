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
package com.infosys.icets.icip.dataset.repository.jpql;

import java.util.List;

import org.springframework.data.domain.Pageable;
//import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.dataset.model.ICIPSpecTemplate;
import com.infosys.icets.icip.dataset.model.MlSpecTemplates;
import com.infosys.icets.icip.dataset.model.MlSpecTemplates2;
import com.infosys.icets.icip.dataset.repository.MlSpecTemplatesRepository;

@Repository
public interface MlSpecTemplatesRepositoryJPQL extends MlSpecTemplatesRepository {


	/* JPQL Queries */
	@Query("SELECT mls FROM MlSpecTemplates mls where mls.domainname = ?1")
	List<MlSpecTemplates> getActiveMlSpecTemplateByDomainName(String domainName);
	
	@Query("SELECT mls FROM MlSpecTemplates2 mls where mls.organization = ?1 ORDER BY mls.lastmodifiedon DESC")
	List<MlSpecTemplates2> getAllMlSpecTemplates(String org);
	
	@Query("SELECT mls FROM MlSpecTemplates mls where LOWER(mls.domainname) = LOWER(?1) and mls.organization = ?2")
	MlSpecTemplates getMlSpecTemplateByDomainNameAndOrganization(String domainName,String organization);	
	
	@Query("SELECT mls.domainname FROM MlSpecTemplates mls where mls.organization = ?1")
	List<String> getSpecTemplatesNamesByOrganization(String org);
	
	/* JPQL Queries */
	@Query("SELECT sp FROM ICIPSpecTemplate sp where sp.templateName = ?1")
	ICIPSpecTemplate searchByTemplateName(String templateName);

	@Query("SELECT sp.templateName FROM ICIPSpecTemplate sp")
	List<String> getAllTemplateNames();

	@Query("SELECT sp FROM ICIPSpecTemplate sp")
	List<ICIPSpecTemplate> getAllSpecTemplates();
	
	@Query("SELECT m FROM MlSpecTemplates2 m WHERE m.organization = :org AND m.domainname LIKE %:domainname% ORDER BY m.lastmodifiedon DESC")
	List<MlSpecTemplates2> getAllMlSpecTemplatesByOrganizationAndDomainname(@Param("org") String org,
			@Param("domainname") String domainname, Pageable paginate);

	@Query("SELECT m FROM MlSpecTemplates2 m WHERE m.organization = :org AND m.capability LIKE %:capability% ORDER BY m.lastmodifiedon DESC")
	List<MlSpecTemplates2> getMlSpecTemplatesByOrganizationAndCapability(@Param("org") String org,
			@Param("capability") String capability);

	@Query("SELECT m FROM MlSpecTemplates2 m WHERE m.organization =?1 ORDER BY m.lastmodifiedon DESC")
	List<MlSpecTemplates2> getAllMlSpecTemplatesByOrganization(String org, Pageable paginate);
	
}
