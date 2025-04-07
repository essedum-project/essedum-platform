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

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPlugin;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginScript;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPPluginScriptRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginScriptService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPluginScriptService.
 *
 * @author icets
 */
@Service
@Transactional
public class ICIPPluginScriptService implements IICIPPluginScriptService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPluginScriptService.class);

	/** The plugin repository. */
	@Autowired
	private ICIPPluginScriptRepository pluginRepository;

	/**
	 * Fetch all.
	 *
	 * @return the string
	 */
	@Override
	public String fetchAll() {
		logger.info("Getting all Plugins");
		List<ICIPPluginScript> plugins = pluginRepository.findAll();
		return plugins.toString();
	}

	/**
	 * Save.
	 *
	 * @param pluginName  the plugin name
	 * @param script the script
	 * @param type the type
	 * @return the ICIP plugin
	 */
	public ICIPPluginScript save(String name, String script, String type,String pluginName) {
		ICIPPluginScript plugin = new ICIPPluginScript();
		plugin.setName(name);
		plugin.setType(type);
		plugin.setPluginname(pluginName);

		ExampleMatcher matcher = ExampleMatcher.matching().withMatcher("name", match -> match.ignoreCase().exact());
		Example<ICIPPluginScript> example = Example.of(plugin, matcher);

		ICIPPluginScript pluginFetched = pluginRepository.findOne(example).orElse(plugin);
		pluginFetched.setScript(script);
		logger.info("Saving plugin script{}", pluginName);
		return pluginRepository.save(pluginFetched);
	}

	/**
	 * Fetch by type.
	 *
	 * @param type the type
	 * @return the string
	 */
	@Override
	public String fetchByType(String type) {
		logger.info("Fetching plugins by Type {}", type);
		List<ICIPPluginScript> plugins = pluginRepository.getByType(type);
		return plugins.toString();
	}

	@Override
	public String updateScript(String pluginname, String script) {
		// TODO Auto-generated method stub
		ICIPPluginScript pluginscriptFetched = pluginRepository.findByPluginname(pluginname);
		if(pluginscriptFetched == null) {
			return null;
		}
		pluginscriptFetched.setScript(script);
		pluginRepository.save(pluginscriptFetched);
		
		return "Done";
	}

	

}
