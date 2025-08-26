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
