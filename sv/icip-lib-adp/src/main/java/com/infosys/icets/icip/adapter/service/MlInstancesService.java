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
