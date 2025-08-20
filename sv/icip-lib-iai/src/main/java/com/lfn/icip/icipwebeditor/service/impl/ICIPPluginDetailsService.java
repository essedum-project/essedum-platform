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

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.lfn.icip.icipwebeditor.model.ICIPImageSaving;
import com.lfn.icip.icipwebeditor.model.ICIPPluginDetails;
import com.lfn.icip.icipwebeditor.repository.ICIPPluginDetailsRepository;
import com.lfn.icip.icipwebeditor.repository.ICIPPluginRepository;
//import com.lfn.icip.icipwebeditor.repository.ICIPPluginDetailsRepository;
import com.lfn.icip.icipwebeditor.service.IICIPPluginDetailsService;

//TODO: Auto-generated Javadoc
//
/**
* The Class ICIPPluginService.
*
* @author essedum
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
