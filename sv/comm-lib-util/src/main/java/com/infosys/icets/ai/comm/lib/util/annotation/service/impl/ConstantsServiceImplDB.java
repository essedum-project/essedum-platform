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

package com.infosys.icets.ai.comm.lib.util.annotation.service.impl;

import java.util.LinkedList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.iamp.usm.domain.DashConstant2;
import com.infosys.icets.iamp.usm.repository.DashConstantRepository2;

/**
 * Service Implementation for managing DashConstant.
 */
/**
 * @author icets
 */
@Profile("dbconstants")
@Service
@Transactional
public class ConstantsServiceImplDB extends ConstantsServiceImplAbstract implements ConstantsService{

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ConstantsServiceImplDB.class);

	@Autowired
	/** The dash constant repository. */
	private DashConstantRepository2 dash_constantRepository2;

	@Autowired
	private Environment environment;


	@Override
	public String findByKeys(String key, String project) {
		log.debug("Request to get dash-constants for leapPropertyCache");
		DashConstant2 dashConstant2 = dash_constantRepository2.findByKeys(key, project);
		if (dashConstant2 != null) {
			String element = dashConstant2.getValue();
			int index1 = element.indexOf("@!");
			int index2 = element.indexOf("!@");
			if (index1 >= 0 && index2 > index1) {
				String newkey = element.substring(index1 + 2, index2);
				if (environment.containsProperty(newkey)) {
					return createElement(element, environment.getProperty(newkey), index1, index2);
				}
			}
			return element;
		}
		return "";
	}

	
	@Override
	public List<String> findByKeyArray(String key, String project) {
		log.debug("Request to get dash-constants for leapPropertiesCache");
		List<String> rawList = dash_constantRepository2.findByKeyArrays(key, project);
		return processList(rawList, project);
	}

	private List<String> processList(List<String> list, String project) {
		if (list != null && !list.isEmpty()) {
			List<String> finalList = new LinkedList<>();
			list.forEach(element -> {
				int index1 = element.indexOf("@!");
				int index2 = element.indexOf("!@");
				if (index1 >= 0 && index2 > index1) {
					String key = element.substring(index1 + 2, index2);
					if (environment.containsProperty(key)) {
						finalList.add(createElement(element, environment.getProperty(key), index1, index2));
					} else {
						DashConstant2 tmp = dash_constantRepository2.findByKeys(key, project);
						if (tmp != null && tmp.getValue() != null) {
							finalList.add(createElement(element, tmp.getValue(), index1, index2));
						} else {
							finalList.add(element);
						}
					}
				} else {
					finalList.add(element);
				}
			});
			return finalList;
		}
		return list;
	}

	private String createElement(String element, String value, int index1, int index2) {
		return element.substring(0, index1) + value + element.substring(index2 + 2);
	}


}