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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.dataset.model.MlAdapters;

/**
 * Spring Data JPA repository for the MlAdapters entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface MlAdaptersRepository extends JpaRepository<MlAdapters, Integer> {

	List<MlAdapters> getMlAdapteByNameAndOrganization(String name, String org);

	List<MlAdapters> getMlAdaptesByOrganization(String org);
	
	List<MlAdapters> getMlAdaptersBySpecTemplateDomainNameAndOrg(String spectemplatedomainname, String org);
	
	List<String> getAdapterNamesByOrganization(String org);
	
	Long getAdaptersCountByOptionalParams(String organization, List<String> category, List<String> spectemplatedomainname, 
			List<String> connectionname, String name);
	
	Page<MlAdapters>  getAdaptersByOptionalParams(String organization, List<String> category, List<String> spectemplatedomainname, 
			List<String> connectionname, String name, Pageable page);

}
