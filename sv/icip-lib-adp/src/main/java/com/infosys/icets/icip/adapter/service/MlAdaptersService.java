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
