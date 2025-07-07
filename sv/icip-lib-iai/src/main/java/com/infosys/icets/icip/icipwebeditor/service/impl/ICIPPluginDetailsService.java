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

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPImageSaving;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginDetails;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPluginDetailsRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPluginRepository;
//import com.infosys.icets.icip.icipwebeditor.repository.ICIPPluginDetailsRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginDetailsService;

//TODO: Auto-generated Javadoc
//
/**
* The Class ICIPPluginService.
*
* @author icets
*/
@Service
@Transactional
public class ICIPPluginDetailsService implements IICIPPluginDetailsService {
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPluginService.class);
	
	/** The ncs. */
	@Autowired
	private NameEncoderService ncs;
	
	@Autowired
	private ICIPPluginDetailsRepository pluginDetailsRepository;

	@Autowired
	private ICIPPluginRepository pluginRepository;
	
	@SuppressWarnings("deprecation")
	@Override
	public List<ICIPPluginDetails> fetchByTypeAndOrg(String type, String org) {
		logger.info("Fetching plugins by Type and Org", type);
		List<ICIPPluginDetails> pluginsNode = new ArrayList<>();
		List<ICIPPluginDetails> pluginsNodeCore = new ArrayList<>();
		List<ICIPPluginDetails> pluginsNodeOrg = pluginDetailsRepository.getByTypeAndOrg(type,org);
		pluginsNode.addAll(pluginsNodeOrg);
		if(!org.equalsIgnoreCase("Core")) {
			pluginsNodeCore = pluginDetailsRepository.getByTypeAndOrg(type,"Core");
			pluginsNode.addAll(pluginsNodeCore);
		}
		return pluginsNode;
	}
	
	@Override
	public int fetchCountByType(String type) {
		int count = 0;
		count = pluginDetailsRepository.fetchPluginCount(type);
		return count;
	}

	@Override
	public ICIPPluginDetails save(ICIPPluginDetails nodeDetails) {
		return createNameAndSave(nodeDetails);
	}
	
	public ICIPPluginDetails createNameAndSave(ICIPPluginDetails nodeDetails) {
		logger.info("Saving plugin details");
		if (nodeDetails.getPluginname() == null || nodeDetails.getPluginname().trim().isEmpty()) {
			boolean uniqueName = true;
			String name = null;
			String nodeName = new JSONObject(nodeDetails.getPlugindetails()).getString("name");
			do {
				name = ncs.nameEncoder(nodeDetails.getOrg(), nodeName);
				uniqueName = pluginDetailsRepository.countByPluginname(name) == 0;
				logger.info(name);
			} while (!uniqueName);
			nodeDetails.setPlugindetails(new JSONObject(nodeDetails.getPlugindetails()).put("id", name).toString());
			nodeDetails.setPluginname(name);
		}
		return pluginDetailsRepository.save(nodeDetails);
	}

	@Override
	public ICIPPluginDetails updateNode(String pluginname, String pluginValue, String org) {
		ICIPPluginDetails plug = pluginDetailsRepository.getByPluginnameAndOrg(pluginname,org);
		plug.setPlugindetails(pluginValue);
		pluginDetailsRepository.save(plug);
		return plug;
	}

	@Override
	public boolean delete(String name,String org) {
		ICIPPluginDetails plug = pluginDetailsRepository.getByPluginnameAndOrg(name, org);
		if(plug != null && plug.getOrg().equalsIgnoreCase(org)) {
			pluginDetailsRepository.deleteByNameAndOrg(name,org);
			return true;
		}
		else
			return false;
	}
	
	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPPluginDetails> plugindetailsList = pluginDetailsRepository.getByOrg(fromProjectName);
		plugindetailsList.stream().forEach(plugindetails -> {
			ICIPPluginDetails plug = pluginDetailsRepository.getByPluginnameAndOrg(plugindetails.getPluginname(),fromProjectName);
			try {
			plug.setId(null);
			plug.setOrg(toProjectId);
			pluginDetailsRepository.save(plug);
			}
			catch (Exception e) {
				logger.error("Error in schemaFormService Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}
	
}
