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