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
package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPartialGroups;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPGroupModelRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPartialGroupsRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPartialGroupsService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPartialGroupsService.
 *
 * @author icets
 */
@Service
@Transactional
public class ICIPPartialGroupsService implements IICIPPartialGroupsService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPartialGroupsService.class);

	/** The i CIP groups repository. */
	@Autowired
	private ICIPPartialGroupsRepository iCIPGroupsRepository;

	/** The icip group model repositoy. */
	@Autowired
	private ICIPGroupModelRepository icipGroupModelRepositoy;

	/**
	 * Gets the groups by org.
	 *
	 * @param organization the organization
	 * @param page         the page
	 * @param size         the size
	 * @return the groups by org
	 */
	@Override
	public List<ICIPPartialGroups> getGroupsByOrg(String organization, int page, int size) {
		logger.info("Getting Groups by Organization {}", organization);
		return iCIPGroupsRepository.findByOrganization(organization);
	}

	/**
	 * Gets the groups len by org.
	 *
	 * @param org the org
	 * @return the groups len by org
	 */
	@Override
	public Long getGroupsLenByOrg(String org) {
		logger.info("Getting Groups Length by Organization {}", org);
		return iCIPGroupsRepository.countByOrganization(org);
	}

	/**
	 * Gets the featured groups by org.
	 *
	 * @param organization the organization
	 * @return the featured groups by org
	 */
	@Override
	public List<ICIPPartialGroups> getFeaturedGroupsByOrg(String organization) {
		logger.info("Getting Groups by Organization {}", organization);
		return iCIPGroupsRepository.findFeaturedByOrganization(organization);
	}

	/**
	 * Gets the all groups by org and entity.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param entityType   the entity type
	 * @return the all groups by org and entity
	 */
	@Override
	public List<ICIPGroupModel> getAllGroupsByOrgAndEntity(String organization, String entity, String entityType) {
		logger.info("Getting Groups by Organization {} and Entity {} and EntityType {}", organization, entity,
				entityType);
		List<?> resp=icipGroupModelRepositoy.findAllByOrganizationAndEntityDatasets(organization, entity, entityType);
		return icipGroupModelRepositoy.findAllByOrganizationAndEntityDatasets(organization, entity, entityType);
	}

	/**
	 * Gets the groups by org and entity.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param entityType   the entity type
	 * @param page         the page
	 * @param size         the size
	 * @return the groups by org and entity
	 */
	@Override
	public List<ICIPPartialGroups> getGroupsByOrgAndEntity(String organization, String entity, String entityType,
			int page, int size) {
		logger.info("Getting Groups by Organization {} and Entity {}", organization, entity);
		if (entityType.contains("pipeline")) {
			return iCIPGroupsRepository.findByOrganizationAndEntityPipelines(organization, entity,
					PageRequest.of(page, size));
		}
		if (entityType.contains("datasource")) {
			return iCIPGroupsRepository.findByOrganizationAndEntityDatasources(organization, entity,
					PageRequest.of(page, size));
		}
		if (entityType.contains("dataset")) {
			return iCIPGroupsRepository.findByOrganizationAndEntityDatasets(organization, entity,
					PageRequest.of(page, size));
		}
		if (entityType.contains("schema")) {
			return iCIPGroupsRepository.findByOrganizationAndEntitySchemas(organization, entity,
					PageRequest.of(page, size));
		}
		if (entityType.contains("agent")) {
			return iCIPGroupsRepository.findByOrganizationAndEntityAgents(organization, entity,
					PageRequest.of(page, size));
		}
		return new ArrayList<>();
	}

	/**
	 * Gets the groups len by org and entity.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @param entityType   the entity type
	 * @return the groups len by org and entity
	 */
	@Override
	public Long getGroupsLenByOrgAndEntity(String organization, String entity, String entityType) {
		logger.info("Getting Groups Length by Organization {} and Entity {}", organization, entity);
		if (entityType.contains("pipeline")) {
			return iCIPGroupsRepository.countByOrganizationAndEntityPipelines(organization, entity);
		}
		if (entityType.contains("datasource")) {
			return iCIPGroupsRepository.countByOrganizationAndEntityDatasources(organization, entity);
		}
		if (entityType.contains("dataset")) {
			return iCIPGroupsRepository.countByOrganizationAndEntityDatasets(organization, entity);
		}
		if (entityType.contains("schema")) {
			return iCIPGroupsRepository.countByOrganizationAndEntitySchemas(organization, entity);
		}
		if (entityType.contains("agent")) {
			return iCIPGroupsRepository.countByOrganizationAndEntityAgents(organization, entity);
		}
		return 0L;
	}

	/**
	 * Gets the single groups by org and entity.
	 *
	 * @param organization the organization
	 * @param entity       the entity
	 * @return the single groups by org and entity
	 */
	@Override
	public ICIPPartialGroups getSingleGroupsByOrgAndEntity(String organization, String entity) {
		logger.info("Getting Single Group by Organization {} and Entity {}", organization, entity);
		return iCIPGroupsRepository.findOneByOrganizationAndEntityPipelines(organization, entity);
	}

	/**
	 * Gets the groups.
	 *
	 * @param organization the organization
	 * @return the groups
	 */
	@Override
	public List<ICIPPartialGroups> getGroups(String organization) {
		return iCIPGroupsRepository.findByOrganization(organization);
	}

}
