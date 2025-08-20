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
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.repository.ICIPDatasetRepository;
import com.lfn.icip.icipwebeditor.model.ICIPGroupModel;
import com.lfn.icip.icipwebeditor.model.ICIPGroupModel2;
import com.lfn.icip.icipwebeditor.model.ICIPGroups;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupModelRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPGroupModelRepository2;
import com.lfn.icip.icipwebeditor.service.IICIPGroupModelService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPGroupModelService.
 *
 * @author essedum
 */
@Service
@Transactional
public class ICIPGroupModelService implements IICIPGroupModelService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPGroupModelService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The i CIP groups repository. */
	private ICIPGroupModelRepository groupModelRepository;
	
	/** The i CIP groups repository. */
	private ICIPGroupModelRepository2 groupModelRepository2;

	/** The icip groups service. */
	@Autowired
	private ICIPGroupsService icipGroupsService;

	/** The dataset repository. */
	@Autowired
	private ICIPDatasetRepository datasetRepository;

	/**
	 * Instantiates a new ICIP group model service.
	 *
	 * @param iCIPGroupsRepository the i CIP groups repository
	 * @param iCIPGroupsRepository2 the i CIP groups repository 2
	 */
	public ICIPGroupModelService(ICIPGroupModelRepository iCIPGroupsRepository,ICIPGroupModelRepository2 iCIPGroupsRepository2) {
		super();
		this.groupModelRepository = iCIPGroupsRepository;
		this.groupModelRepository2 = iCIPGroupsRepository2;
	}

	/**
	 * Gets the all entities by type for group.
	 *
	 * @param entityType the entity type
	 * @param groupName  the group name
	 * @param org        the org
	 * @return the all entities by type for group
	 */
	@Override
	public List<ICIPGroupModel> getAllEntitiesByTypeForGroup(String entityType, String groupName, String org) {
		logger.info("Fetching entities by type {} and group name {} and organization {}", entityType, groupName, org);
		return groupModelRepository.findByEntityTypeAndGroups_nameAndOrganization(entityType, groupName, org);
	}

	/**
	 * Gets the all entities by org and type.
	 *
	 * @param organization the organization
	 * @param type         the type
	 * @return the all entities by org and type
	 */
	@Override
	public List<ICIPGroupModel> getAllEntitiesByOrgAndType(String organization, String type) {
		logger.info("Fetching entities by type {}", type);
		return groupModelRepository.getEntityByOrganizationAndEntityType(organization, type);
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
		List<ICIPGroupModel> dsets = groupModelRepository.findByOrganization(fromProjectId);
		dsets.stream().forEach(ds -> {
			ds.setOrganization(toProjectId);
			groupModelRepository.save(ds);
		});
		return true;
	}

	/**
	 * Save.
	 *
	 * @param entityType the entity type
	 * @param entityName the entity name
	 * @param organization the organization
	 * @param groupNames      the group
	 * @return the ICIP group model
	 */
	@Override
	public boolean save(String entityType, String entityName,String organization, List<String> groupNames) {
		groupModelRepository.deleteByEntityAndEntityTypeAndOrganization(entityName,entityType,organization);
		groupNames.forEach(groupname->{
			ICIPGroupModel2 model = new ICIPGroupModel2(null, groupname, entityType, entityName, organization);
			try {
			groupModelRepository2.save(model);
			}catch (DataIntegrityViolationException e) {
				logger.info("Already group mapping exists");
			}
		});
		return true;
	}

	/**
	 * Delete.
	 *
	 * @param entity       the entity
	 * @param entityType   the entity type
	 * @param organization the organization
	 */
	@Override
	public void delete(String entity, String entityType, String organization) {
		List<ICIPGroupModel> entities = groupModelRepository.findByEntityAndEntityTypeAndOrganization(entity,
				entityType, organization);
		if (!entities.isEmpty())
			if (entities.get(0).getGroups().getOrganization().equals(organization))
				groupModelRepository.deleteInBatch(entities);
			else {
				if (entities.get(0).getGroups().getOrganization().contains(organization)) {
					String orgs = entities.get(0).getGroups().getOrganization();
					List<String> listoforgs = new ArrayList<>();
					for (String org : orgs.split(",")) {
						if (org.equals(organization))
							continue;
						listoforgs.add(org);
					}
					entities.get(0).getGroups().setOrganization(listoforgs.toString());
					groupModelRepository.save(entities.get(0));
				}
			}
		logger.info("Delete Entities");

	}

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param groupMap      the group map
	 * @return true, if successful
	 */
	@Override
	public Map<ICIPGroupModel, ICIPGroupModel> copy(Marker marker, String fromProjectId, String toProjectId,
			Map<ICIPGroups, ICIPGroups> groupMap) {
		joblogger.info(marker, "Fetching groupModel for Entity {}", fromProjectId);
		List<ICIPGroupModel> icGrps = groupModelRepository.findByOrganization(fromProjectId);
		HashMap<ICIPGroupModel, ICIPGroupModel> groupModelMap = new HashMap<>();
		List<ICIPGroupModel> toGrps = icGrps.parallelStream().map(grp -> {
			grp.setId(null);
			grp.setOrganization(toProjectId);
			if (grp.getGroups() != null) {
				ICIPGroups tmpGroup = grp.getGroups();
				tmpGroup.setId(null);
				tmpGroup.setOrganization(toProjectId);
				tmpGroup.setGroupsModel(null);
				grp.setGroups(groupMap.get(tmpGroup));
			}
			return grp;
		}).collect(Collectors.toList());
		toGrps.parallelStream().forEach(grp -> {
			try {
				ICIPGroupModel newModel = groupModelRepository.save(grp);
				joblogger.info(marker, "Saved GroupModel {}", newModel.getId());
				groupModelMap.put(grp, newModel);
			} catch (Exception e) {
				joblogger.error(marker, e.getMessage());
			}
		});
		return groupModelMap;
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	public void delete(String project) {
		groupModelRepository.deleteByProject(project);
	}

	/**
	 * Copy Group Models for datasets.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param datasets      the datasets
	 * @return true, if successful
	 */

	public boolean copyGroupModel(Marker marker, String fromProjectId, String toProjectId, List<String> datasets) {
		joblogger.info(marker, "Fetching groupModel for Entity {}", fromProjectId);
		ICIPGroups grp = icipGroupsService.getGroup("Copied Entities", toProjectId);
		if(grp == null) {
			ICIPGroups group = new ICIPGroups();
			group.setDescription("Copied entities");
			group.setAlias("Copied Entities");
			group.setName("Copied Entities");
			group.setOrganization(toProjectId);
			grp = icipGroupsService.save(group);
		}
		ICIPGroups group = grp; 
		datasets.stream().forEach(dataset -> {
			try {
				ICIPDataset dset = datasetRepository.findByNameAndOrganization(dataset, fromProjectId);
				if (dset.getSchema() != null) {
					save("schema", dset.getSchema().getName(), group);
				}
				save("dataset", dataset, group);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}
		});
		return true;
	}
	
	public boolean copyTemplate(Marker marker, String fromProjectId, String toProjectId) {
		joblogger.info(marker, "Fetching datasets for groups for Entity {}", fromProjectId);
		List<ICIPDataset> datasets = datasetRepository.findByOrganization(toProjectId);

		datasets.stream().forEach(dset -> {
			List<ICIPGroupModel> groupModel= groupModelRepository.findByEntityAndOrganization(dset.getName(),fromProjectId);
			
			for(int indexgroup=0;indexgroup<groupModel.size();++indexgroup) 
			{
				ICIPGroupModel groupModelatindex= groupModel.get(indexgroup);
				groupModelatindex.setId(null);
				groupModelatindex.setOrganization(toProjectId);
				String modelGroup=groupModelatindex.getModelGroup();
				
				try {
					icipGroupsService.copyTemplate(marker, modelGroup,fromProjectId, toProjectId);
				}catch (DataIntegrityViolationException e) {
					joblogger.error(marker, e.getMessage());
				}

			try {
				savenewgroupModelCopyTemplate(groupModelatindex);
			} catch (DataIntegrityViolationException e) {
				joblogger.error(marker, e.getMessage());
			}
		}
		});
		return true;
	}


	/**
	 * Copy Group Models for Pipelines.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @param pipeline      the pipeline
	 * @param schemas       the schemas
	 * @return true, if successful
	 */

	public boolean copyGroupModel(Marker marker, String fromProjectId, String toProjectId, String pipeline,
			List<String> schemas) {
		joblogger.info(marker, "Fetching groupModel for Entity {}", fromProjectId);
		ICIPGroups grp = icipGroupsService.getGroup("Copied Entities", toProjectId);
		if(grp == null) {
			ICIPGroups group = new ICIPGroups();
			group.setDescription("Copied entities");
			group.setAlias("Copied Entities");
			group.setName("Copied Entities");
			group.setOrganization(toProjectId);
			grp = icipGroupsService.save(group);
		}
		ICIPGroups group = grp; 
		try {
			save("pipeline", pipeline, group);
			if (schemas.size() != 0)
				schemas.forEach(x -> {
					if (x != null)
						save("schema", x, group);
				});
		} catch (DataIntegrityViolationException e) {
			joblogger.error(marker, e.getMessage());
		}
		return true;
	}

	/**
	 * Export group model.
	 *
	 * @param org        the org
	 * @param entityType the entity type
	 * @param entities   the entities
	 * @return the list
	 */
	@Override
	public List<List<ICIPGroupModel>> exportGroupModel(String org, String entityType, List<String> entities) {
		List<List<ICIPGroupModel>> grpsModelLst = new ArrayList<>();
		entities.stream().forEach(entity -> {
			grpsModelLst
					.add(groupModelRepository.getEntityByOrganizationAndEntityTypeAndEntity(org, entityType, entity));
		});
		return grpsModelLst;
	}

	/**
	 * Save.
	 *
	 * @param entityType the entity type
	 * @param entity the entity
	 * @param newGp the new gp
	 */
	@Override
	public void save(String entityType, String entity, ICIPGroups newGp) {
		ICIPGroupModel2 groupModel = groupModelRepository2.findByEntityAndEntityTypeAndModelGroupAndOrganization(entity,entityType,newGp.getName(),newGp.getOrganization());
		if(groupModel==null) {
			groupModel = new ICIPGroupModel2();
			groupModel.setEntity(entity);
			groupModel.setEntityType(entityType);
			groupModel.setModelGroup(newGp.getName());
			groupModel.setOrganization(newGp.getOrganization());
			groupModelRepository2.save(groupModel);
		}
		
	}
	
	@Override
	public void savenewgroupModelCopyTemplate(ICIPGroupModel groupModelatindex) {
		// TODO Auto-generated method stub
		
		ICIPGroupModel2 groupModel =new ICIPGroupModel2();
		groupModel.setEntity(groupModelatindex.getEntity());
		groupModel.setEntityType(groupModelatindex.getEntityType());
		groupModel.setModelGroup(groupModelatindex.getModelGroup());
		groupModel.setOrganization(groupModelatindex.getOrganization());
		try {
			groupModelRepository2.save(groupModel);
		}
		catch(Exception E) {
			logger.error("Error in saving group model  {}",E.getMessage());
		}
		
	}

}