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

package com.infosys.icets.icip.dataset.service.impl;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.infosys.icets.icip.dataset.model.ICIPMlIntstance;
import com.infosys.icets.icip.dataset.repository.ICIPMlIntstanceRepository;
import com.infosys.icets.icip.dataset.service.ICIPMlIntstanceService;
/**
 * The Class ICIPMlIntstanceServiceImpl.
 *
 * @author icets
 */
@Service
@RefreshScope
public class ICIPMlIntstanceServiceImpl implements ICIPMlIntstanceService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPMlIntstanceServiceImpl.class);

	/** The mlintstance repository. */
	private ICIPMlIntstanceRepository iCIPMlIntstanceRepository;

	/** The ncs. */
	private NameEncoderService ncs;

	public ICIPMlIntstanceServiceImpl(ICIPMlIntstanceRepository iCIPMlIntstanceRepository, NameEncoderService ncs) {
		super();
		this.iCIPMlIntstanceRepository = iCIPMlIntstanceRepository;
		this.ncs = ncs;
	}

	public ICIPMlIntstance getICIPMlIntstance(String name, String organization) {
		return iCIPMlIntstanceRepository.findByNameAndOrganization(name, organization);
	}

	@Override
	public ICIPMlIntstance save(String idOrName, ICIPMlIntstance iCIPMlIntstance) throws NoSuchAlgorithmException {
		try {
			logger.debug("creating mlintstance");
			if (iCIPMlIntstance.getName() == null || iCIPMlIntstance.getName().trim().isEmpty()) {
				String name = createName(iCIPMlIntstance.getOrganization(), iCIPMlIntstance.getAlias());
				iCIPMlIntstance.setName(name);
				iCIPMlIntstance = iCIPMlIntstanceRepository.save(iCIPMlIntstance);
			}
		} catch (Exception e) {
			logger.error(e.getMessage());
		}
		return iCIPMlIntstance;

	}

	@Override
	public String createName(String org, String alias) {
		boolean uniqueName = true;
		String name = null;
		do {
			name = ncs.nameEncoder(org, alias);
			uniqueName = iCIPMlIntstanceRepository.countByName(name) == 0;
		} while (!uniqueName);
		logger.info(name);
		return name;
	}

	@Override
	public ICIPMlIntstance getICIPMlIntstancesByNameAndOrg(String name, String org) {
		return iCIPMlIntstanceRepository.findByNameAndOrganization(name, org);
	}

	@Override
	public int countByName(String name) {
		return iCIPMlIntstanceRepository.countByName(name);
	}

	@Override
	public void delete(String name, String org) {
		ICIPMlIntstance iCIPMlIntstance = iCIPMlIntstanceRepository.findByNameAndOrganization(name, org);
		iCIPMlIntstanceRepository.delete(iCIPMlIntstance);
	}

	@Override
	public List<ICIPMlIntstance> getICIPMlIntstancesByAliasAndOrg(String alias, String org) {
		return iCIPMlIntstanceRepository.findByAliasAndOrganization(alias, org);
	}
	
	public List<ICIPMlIntstance> getICIPMlIntstancesByOrg(String organization) {
		return iCIPMlIntstanceRepository.findByOrganization(organization);
	}

}