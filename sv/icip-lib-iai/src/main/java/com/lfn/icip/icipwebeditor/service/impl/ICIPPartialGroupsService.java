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

package com.lfn.icip.icipwebeditor.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;
import com.lfn.icip.icipwebeditor.model.ICIPPartialGroups;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupModelRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPPartialGroupsRepository;
import com.lfn.icip.icipwebeditor.service.IICIPPartialGroupsService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPartialGroupsService.
 *
 * @author essedum
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
