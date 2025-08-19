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
