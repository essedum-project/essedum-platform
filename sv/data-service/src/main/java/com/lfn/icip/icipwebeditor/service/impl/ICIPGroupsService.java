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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.domain.NameAndAliasDTO;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;
import com.lfn.icip.icipwebeditor.model.ICIPGroups;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupModelRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupModelRepository2;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupsRepository;
import com.lfn.icip.icipwebeditor.service.IICIPGroupsService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPGroupsService.
 *
 * @author essedum
 */
@Service
@Transactional
public class ICIPGroupsService implements IICIPGroupsService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPGroupsService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The i CIP groups repository. */
	@Autowired
	private ICIPGroupsRepository groupsRespository;

	/** The model repo. */
	@Autowired
	private ICIPGroupModelRepository groupsModelRepository;
	
	/** The model repo. */
	@Autowired
	private ICIPGroupModelRepository2 groupsModelRepository2;

	/** The ncs. */
	@Autowired
	private NameEncoderService ncs;

	/**
	 * Delete.
	 *
	 * @param name    the name
	 * @param project the project
	 */
	public void delete(String name, String project) {
		ICIPGroups groups = new ICIPGroups();
		groups.setName(name);
		groups.setOrganization(project);
		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().exact())
				.withMatcher("organization", match -> match.ignoreCase().exact());
		Example<ICIPGroups> example = Example.of(groups, matcher);
		Optional<ICIPGroups> iCIPGroupsFetched = groupsRespository.findOne(example);
		if (iCIPGroupsFetched.isPresent()) {
			ICIPGroups iCIPGroups = iCIPGroupsFetched.get();
			List<ICIPGroupModel> groupModels = groupsModelRepository
					.findByGroups_nameAndOrganization(iCIPGroups.getName(), iCIPGroups.getOrganization());
			for (ICIPGroupModel groupModel : groupModels) {
				groupsModelRepository.delete(groupModel);
			}
			logger.info("Deleting the group {}", name);
			groupsRespository.delete(iCIPGroupsFetched.get());
		}
	}

	/**
	 * Gets the group names.
	 *
	 * @param organization the organization
	 * @return the group names
	 */
	@Override
	public List<NameAndAliasDTO> getGroupNames(String organization) {
		return groupsRespository.findNameByOrganization(organization);
	}

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean renameProject(String fromProjectId, String toProjectId) {
		List<ICIPGroups> dsets = groupsRespository.findByOrganization(fromProjectId);
		dsets.stream().forEach(ds -> {
			ds.setOrganization(toProjectId);
			groupsRespository.save(ds);
		});
		return true;
	}

	/**
	 * Save.
	 *
	 * @param group the i CIP groups 2 save
	 * @return the ICIP groups
	 */
	@Override
	public ICIPGroups save(ICIPGroups group) {
		ICIPGroups fetched;

		if (group.getName() != null) {
			fetched = groupsRespository.findByNameAndOrganization(group.getName(), group.getOrganization());
			if (fetched != null)
				group.setId(fetched.getId());
		}
		if(group.getName()==null || group.getName().length()==0 )
			group.setName(this.createName(group.getOrganization(), group.getAlias()));
		
		fetched =  groupsRespository.save(group);
		group.getGroupsModel().forEach(grp->{
			ICIPGroupModel model = new ICIPGroupModel();
			model.setEntity(grp.getEntity());
			model.setEntityType(grp.getEntityType());
			model.setModelGroup(group.getName());
			model.setOrganization(group.getOrganization());
			if(groupsModelRepository2.findByEntityAndEntityTypeAndModelGroupAndOrganization(grp.getEntity(), grp.getEntityType(), group.getName(), group.getOrganization())==null) {
				groupsModelRepository.save(model);
			}			
		});
		return fetched;

	}

	/**
	 * Creates the name.
	 *
	 * @param org the org
	 * @param alias the alias
	 * @return the string
	 */
	@Override
	public String createName(String org, String alias) {
		Boolean uniqueName = true;
		String name = null;
		do {
			name = ncs.nameEncoder(org, alias);
			if (groupsRespository.countByName(name) != 0) {
				uniqueName = false;
			} else {
				uniqueName = true;
			}
		} while (uniqueName == false);
		logger.info(name);
		return name;
	}

	/**
	 * Gets the group.
	 *
	 * @param groupName the group name
	 * @param project   the project
	 * @return the group
	 */
	@Override
	public ICIPGroups getGroup(String groupName, String project) {
		ICIPGroups group = new ICIPGroups();
		group.setName(groupName);
		group.setOrganization(project);
		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().exact())
				.withMatcher("organization", match -> match.ignoreCase().exact());
		Example<ICIPGroups> example = Example.of(group, matcher);

		Optional<ICIPGroups> fetched = groupsRespository.findOne(example);
		return fetched.isPresent() ? fetched.get() : null;
	}

	/**
	 * Delete group entities.
	 *
	 * @param group the group
	 * @return the int
	 */
	public int deleteGroupEntities(ICIPGroups group) {
		logger.info("Deleting group by Id {}", group.getId());
		return groupsModelRepository.deleteByGroups_id(group.getId());
	}

	/**
	 * Gets the groups for entity.
	 *
	 * @param entityType   the entity type
	 * @param entity       the entity
	 * @param organization the organization
	 * @return the groups for entity
	 */
	@Override
	public List<ICIPGroups> getGroupsForEntity(String entityType, String entity, String organization) {
		logger.info("Fetching groups for Entity {}", entity);
		return groupsRespository.findByOrganizationAndGroupsModel_EntityAndGroupsModel_EntityType(organization, entity,
				entityType);
	}

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public List<Map> copy(Marker marker, String fromProjectId, String toProjectId) {
		joblogger.info(marker, "Fetching groups for Entity {}", fromProjectId);
		List<ICIPGroups> icGrps = groupsRespository.findByOrganization(fromProjectId);
		HashMap<String, List<ICIPGroupModel>> map = new HashMap<>();
		HashMap<ICIPGroups, ICIPGroups> groupMap = new HashMap<>();
		List<ICIPGroups> toGrps = icGrps.parallelStream().map(grp -> {
			grp.setId(null);
			grp.setOrganization(toProjectId);
			map.put(grp.getName(), grp.getGroupsModel());
			grp.setGroupsModel(null);
			return grp;
		}).collect(Collectors.toList());
		toGrps.parallelStream().forEach(grp -> {
			try {
				joblogger.info(marker, "Saving group {}", grp.getName());
				ICIPGroups newGroup = groupsRespository.save(grp);
				groupMap.put(grp, newGroup);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}
		});
		List<Map> list = new ArrayList<>();
		list.add(map);
		list.add(groupMap);
		return list;
	}	
	
	@Override
	public void copyTemplate(Marker marker, String groupName,String fromProjectId, String toProjectId) {
		joblogger.info(marker, "Fetching groups for Name and ORG {}  {}", groupName,fromProjectId);
		ICIPGroups grp = groupsRespository.findByNameAndOrganization(groupName, fromProjectId);
		
			grp.setId(null);
			grp.setOrganization(toProjectId);

			try {
				joblogger.info(marker, "Saving group {}", grp.getName());
				ICIPGroups newGroup = groupsRespository.save(grp);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}

	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	public void delete(String project) {
		groupsRespository.deleteByProject(project);
	}
	@Override
	public List<ICIPGroups> getGroupsByOrganizationAndType(String organization,String type) {
		return groupsRespository.findByOganizationAndType(organization,type);
	}

}