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

package com.lfn.icip.dataset.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.dataset.model.MlSpecTemplates;
import com.lfn.icip.dataset.model.MlSpecTemplates2;

/**
 * Spring Data JPA repository for the MlSpecTemplates entity.
 */
/**
 * @author essedum
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
