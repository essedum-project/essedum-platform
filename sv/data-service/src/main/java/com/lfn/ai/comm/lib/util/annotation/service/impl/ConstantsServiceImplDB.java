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

package com.lfn.ai.comm.lib.util.annotation.service.impl;

import java.util.LinkedList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.service.configkeys.support.ConfigurationKeysService;
import com.lfn.iamp.usm.domain.DashConstant2;
import com.lfn.iamp.usm.repository.DashConstantRepository;
import com.lfn.iamp.usm.repository.DashConstantRepository2;

/**
 * Service Implementation for managing DashConstant.
 *
 * @author essedum
 */
@Profile("dbconstants")
@Service
@Transactional
public class ConstantsServiceImplDB extends ConstantsServiceImplAbstract {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ConstantsServiceImplDB.class);

	public ConstantsServiceImplDB(ConfigurationKeysService configurationKeysService,
			DashConstantRepository dashConstantRepository, DashConstantRepository2 dashConstantRepository2,
			Environment environment) {
		super(configurationKeysService, dashConstantRepository, dashConstantRepository2, environment);
	}

	@Override
	public String findByKeys(String key, String project) {
		log.debug("Request to get dash-constants for essedumPropertyCache");
		DashConstant2 dashConstant2 = dashConstantRepository2.findByKeys(key, project);
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
		log.debug("Request to get dash-constants for essedumPropertiesCache");
		List<String> rawList = dashConstantRepository2.findByKeyArrays(key, project);
		return processList(rawList, project);
	}

	private List<String> processList(List<String> list, String project) {
		if (list == null || list.isEmpty()) {
			return list;
		}
		List<String> finalList = new LinkedList<>();
		list.forEach(element -> finalList.add(resolveElement(element, project)));
		return finalList;
	}

	private String resolveElement(String element, String project) {
		int index1 = element.indexOf("@!");
		int index2 = element.indexOf("!@");
		if (index1 < 0 || index2 <= index1) {
			return element;
		}
		String key = element.substring(index1 + 2, index2);
		if (environment.containsProperty(key)) {
			return createElement(element, environment.getProperty(key), index1, index2);
		}
		DashConstant2 tmp = dashConstantRepository2.findByKeys(key, project);
		if (tmp != null && tmp.getValue() != null) {
			return createElement(element, tmp.getValue(), index1, index2);
		}
		return element;
	}

}