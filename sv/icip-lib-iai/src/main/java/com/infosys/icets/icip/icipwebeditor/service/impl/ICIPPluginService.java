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

package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.icipwebeditor.model.ICIPApps;
import com.infosys.icets.icip.icipwebeditor.model.ICIPImageSaving;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPlugin;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginDetails;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginScript;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPluginDetailsRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPluginRepository;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPluginScriptRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginScriptService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPluginService.
 *
 * @author icets
 */
@Service
@Transactional
public class ICIPPluginService implements IICIPPluginService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPluginService.class);
	
	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The plugin repository. */
	@Autowired
	private ICIPPluginRepository pluginRepository;
	
	@Autowired
	private ICIPPluginScriptRepository pluginscriptRepository;
	
	@Autowired
	private IICIPPluginScriptService pluginScriptService;
	
	@Autowired
	private ICIPPluginDetailsRepository pluginDetailsRepository;
	
	@SuppressWarnings("deprecation")
	@Override
	public List<ICIPPlugin> findAll() {
		return pluginRepository.findAll();
	}
	

	@Override
	public List<ICIPPlugin> findByOrg(String org) {
		List<ICIPPlugin> allPlugin = new ArrayList<>();
		List<ICIPPlugin> corePlugin = pluginRepository.findByOrg("Core");
		List<ICIPPlugin> orgPlugin = pluginRepository.findByOrg(org);
		allPlugin.addAll(corePlugin);
		corePlugin.forEach(plug ->{
			String type = plug.getType();
			ICIPPlugin corePlug = pluginRepository.getByTypeAndOrg(type,org);
			allPlugin.remove(corePlug);
		});
		if(corePlugin.size()!=0) {
		allPlugin.addAll(orgPlugin);
		}
		return allPlugin;
	}
	
	@Override
	public List<ICIPPlugin> findPluginByOrg(String org) {
		return pluginRepository.findByOrg(org);
	}
	
	@Override
	public boolean save(ICIPPlugin plugin) {
		int n,t = 0;
		n = pluginRepository.getCountByNameAndOrg(plugin.getName(),plugin.getOrg());
		t = pluginRepository.getCountByTypeAndOrg(plugin.getType(),plugin.getOrg());
		boolean status = false;
		if(t==0 && n==0) {
			pluginRepository.save(plugin);
			status = true;
		}
		return status;
	}
	
	@Override
	public ICIPPlugin updateConfig(String config, String type, String org) {
		ICIPPlugin plug = pluginRepository.getByTypeAndOrg(type,org);
		plug.setConfig(config);
		pluginRepository.save(plug);
		return plug;
	}

	@Override
	public boolean delete(String name, String org) {
		int n = 0;
		n = pluginRepository.getCountByNameAndOrg(name,org);
		if(n == 0)
			return false;
		else {
			String type = pluginRepository.getByNameAndOrg(name,org);
			pluginRepository.deleteByNameAndOrg(name,org);
			pluginDetailsRepository.deleteAllByTypeAndOrg(type,org);
			return true;
		}
	}
	
	@Override
	public ICIPPlugin getPluginByTypeAndOrg(String type, String org) {
		ICIPPlugin plug = pluginRepository.getByTypeAndOrg(type,org);
		return plug;
	}
	
	@Override
	public ICIPPlugin updatePlugin(String value, int id) {
		ICIPPlugin plug = pluginRepository.findById(id).get();
		JSONObject json = new JSONObject(value);
		List<ICIPPluginDetails> pluginsNodes = pluginDetailsRepository.getByTypeAndOrg(plug.getType(),plug.getOrg());
		pluginsNodes.forEach(p ->{
			p.setType(json.get("type").toString());
			String pName = p.getPluginname();
			if(pName.contains(plug.getType())) {
				pName = pName.replace(plug.getType(), json.get("type").toString());
				p.setPluginname(pName);
			}
			pluginDetailsRepository.save(p);
		});
		plug.setName(json.get("name").toString());
		plug.setType(json.get("type").toString());
		plug.setEditortype(json.get("editortype").toString());
		pluginRepository.save(plug);
		return plug;
	}
	
	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPPlugin> pluginList = pluginRepository.findByOrg(fromProjectName);
		pluginList.stream().forEach(plugin -> {
			ICIPPlugin plug = pluginRepository.findById(plugin.getId()).get();
			try {
			plug.setId(null);
			plug.setOrg(toProjectId);
			pluginRepository.save(plug);
			}
			catch (Exception e) {
				joblogger.error("Error in ICIPPlugin Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker,"Exporting plugins started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
//			List<ICIPPlugin> pluginList = pluginRepository.findByOrg(source);
			List<ICIPPlugin> pluginList = new ArrayList<>();
			modNames.forEach(name -> {
				pluginList.add(pluginRepository.findByNameAndOrg(name.toString(), source));
			});
			List<ICIPPluginDetails> pluginsNode = new ArrayList<>();
			pluginList.stream().forEach(plugin -> {
				List<ICIPPluginDetails> pluginsNodeOrg = pluginDetailsRepository.getByTypeAndOrg(plugin.getType(),source);
				pluginsNode.addAll(pluginsNodeOrg);
			});
			jsnObj.add("mlplugin", gson.toJsonTree(pluginList));
			jsnObj.add("mlplugindetails", gson.toJsonTree(pluginsNode));
			joblogger.info(marker, "Exported plugins successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in exporting plugins");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}


	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing plugins started");
			JsonArray plugins = g.fromJson(jsonObject.get("mlplugin").toString(), JsonArray.class);
			JsonArray pluginNodes = g.fromJson(jsonObject.get("mlplugindetails").toString(), JsonArray.class);
			plugins.forEach(x -> {
				ICIPPlugin plu = g.fromJson(x, ICIPPlugin.class);
				ICIPPlugin pluProject = pluginRepository.findByNameAndOrg(plu.getName().toString(), target);
				ICIPPlugin pluCore = pluginRepository.findByNameAndOrg(plu.getName().toString(), "Core");
				if(pluProject == null && pluCore == null) {
					plu.setOrg(target);
					plu.setId(null);
					try {
						pluginRepository.save(plu);
					}
					catch(Exception de) {
						joblogger.error(marker, "Error in importing duplicate plugin {}",plu.getName());
					}
				}
			});
			pluginNodes.forEach(x -> {
				ICIPPluginDetails node = g.fromJson(x, ICIPPluginDetails.class);
				ICIPPluginDetails nodeProject = pluginDetailsRepository.getByPluginnameAndOrg(node.getPluginname().toString(), target);
				ICIPPluginDetails nodeCore = pluginDetailsRepository.getByPluginnameAndOrg(node.getPluginname().toString(), "Core");
				if(nodeProject == null && nodeCore == null) {
					node.setOrg(target);
					node.setId(null);
					try {
						pluginDetailsRepository.save(node);
					}
					catch(Exception de) {
						joblogger.error(marker, "Error in importing duplicate pluginNode {}",node.getPluginname());
					}
				}
			});
			joblogger.info(marker, "Imported plugins successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing plugins");
			joblogger.error(marker, ex.getMessage());
		}
	}
	
}
