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

package com.lfn.icip.dataset.repository.jpql;

import java.util.List;

import org.springframework.data.domain.Pageable;
//import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPSpecTemplate;
import com.lfn.icip.dataset.model.MlSpecTemplates;
import com.lfn.icip.dataset.model.MlSpecTemplates2;
import com.lfn.icip.dataset.repository.MlSpecTemplatesRepository;

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
