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

package com.infosys.icets.icip.icipwebeditor.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.json.JSONObject;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.JsonArray;
import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPlugin;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginDetails;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginDetailsService;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPluginController.
 *
 * @author icets
 */
@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/plugin")
public class ICIPPluginController {

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "plugin";

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPluginController.class);

	/** The plugin service. */
	@Autowired
	private IICIPPluginService pluginService;

	/** The plugin details service. */
	@Autowired
	private IICIPPluginDetailsService pluginDetailsService;
	
	
	/**
	 * Gets the plugins from mlplugin.
	 *
	 * @return the plugin
	 */
	@GetMapping("/allPlugins/{org}")
	public ResponseEntity<List<ICIPPlugin>> getPlugins(@PathVariable(name = "org") String org) {
		logger.info("Getting all plugins");
		return new ResponseEntity<>(pluginService.findByOrg(org), new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/allPluginsByOrg/{org}")
	public ResponseEntity<List<ICIPPlugin>> getPluginsByOrg(@PathVariable(name = "org") String org) {
		logger.info("Getting all plugins by org");
		return new ResponseEntity<>(pluginService.findPluginByOrg(org), new HttpHeaders(), HttpStatus.OK);
	}
	
	
	/**
	 * Save new plugin in mlplugin.
	 *
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/add")
	public ResponseEntity<?> createMshup(@RequestBody ICIPPlugin mashupDto)
			throws URISyntaxException, SQLException {
		logger.info("Creating mashup: {}", mashupDto.getName());
		ModelMapper modelmapper = new ModelMapper();
		ICIPPlugin plugin = modelmapper.map(mashupDto, ICIPPlugin.class);
		if (pluginService.save(plugin)) {
			return ResponseEntity.created(new URI("/plugin/" + plugin.getId()))
					.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, plugin.getId().toString())).body(plugin);
		}
		else
			return ResponseEntity.status(502).body("Duplicate plugin");
		}
	
	
	/**
	 * Gets all pluginNodes from pluginDetails of a type.
	 *
	 * @param pluginType the plugin type
	 * @return the plugin
	 */
	@GetMapping("/all/{pluginType}/{org}")
	public ResponseEntity<List<ICIPPluginDetails>> getPlugin(@PathVariable(name = "pluginType") String pluginType,
			@PathVariable(name = "org") String org) {
		logger.info("Getting Plugin type : {}", pluginType);
		return new ResponseEntity<>(pluginDetailsService.fetchByTypeAndOrg(pluginType,org), new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/count/{pluginType}")
	public ResponseEntity<?> getPluginCount(@PathVariable(name = "pluginType") String pluginType){
		return new ResponseEntity<>(pluginDetailsService.fetchCountByType(pluginType), new HttpHeaders(), HttpStatus.OK);
	}
	
	
	/**
	 * Update config in mlplugin.
	 *
	 * @param pluginType the plugin type
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/updateconfig/{type}/{org}")
	public ResponseEntity<ICIPPlugin> updateConfig(@RequestBody String config,
			@PathVariable(name = "type") String type, @PathVariable(name = "org")String org) throws URISyntaxException, SQLException  {
		logger.info("Updating config for type", type);
		return new ResponseEntity<>(pluginService.updateConfig(config,type,org), new HttpHeaders(), HttpStatus.OK);
	}
	
	
	/**
	 * Save new pluginNode in mlpluginDetails.
	 *
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/addNewNode")
	public ResponseEntity<ICIPPluginDetails> createNewNode(@RequestBody ICIPPluginDetails nodeDetails)
			throws URISyntaxException, SQLException {
		logger.info("Creating new node: {}", nodeDetails.getId());
		ModelMapper modelmapper = new ModelMapper();
		ICIPPluginDetails plugin = modelmapper.map(nodeDetails, ICIPPluginDetails.class);
		ICIPPluginDetails result = pluginDetailsService.save(nodeDetails);
		return ResponseEntity.created(new URI("/plugin/" + result.getId()))
				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);
	}
	
	
	/**
	 * Update pluginDetails in mlpluginDetails.
	 *
	 * @param pluginName the plugin name
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/update/{pluginName}/{org}")
	public ResponseEntity<ICIPPluginDetails> updateNode(@RequestBody String pluginValue,
			@PathVariable(name = "pluginName") String pluginName, @PathVariable(name = "org")String org) throws URISyntaxException {
		ICIPPluginDetails result = pluginDetailsService.updateNode(pluginName, pluginValue, org);
		logger.info("Updating plugin node : {}", pluginName);
		return ResponseEntity.created(new URI("/plugin/" + result.getId()))
				.headers(ICIPHeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getPluginname())).body(result);
	}
	
	
	//	to delete plugin node details 
	/**
	 * Delete plugin Node.
	 *
	 * @param pluginName the plugin name
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@DeleteMapping("/delete/{pluginName}/{org}")
	public ResponseEntity<String> deleteGroups(@PathVariable(name = "pluginName") String pluginName,
			@PathVariable(name = "org")String org) {
		logger.info("deleting pluginNode", pluginName);
		return pluginDetailsService.delete(pluginName,org)? ResponseEntity.ok().headers(ICIPHeaderUtil.
				createEntityDeletionAlert(ENTITY_NAME, pluginName)).build() : ResponseEntity.status(502).body("Could not delete: Organisation mismatch");
	}
	
//	to delete plugin node details 
	/**
	 * Delete plugin Node.
	 *
	 * @param pluginName the plugin name
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@DeleteMapping("/deleteAllNode/{name}/{org}")
	public ResponseEntity<String> deleteAllNode(@PathVariable(name = "name") String name,
			@PathVariable(name = "org")String org) {
		logger.info("deleting plugin", name);
		return pluginService.delete(name,org)? ResponseEntity.ok().headers(ICIPHeaderUtil.
				createEntityDeletionAlert(ENTITY_NAME, name)).build() : ResponseEntity.status(502).body("Could not delete: Organisation mismatch");
	}
	
	
	/**
	 * Gets the plugin iai.
	 *
	 * @return the plugin iai
	 */
//	@GetMapping("/all")
//	public ResponseEntity<String> getPluginIai() {
//		logger.info("Getting PluginIAI");
//		return new ResponseEntity<>(pluginService.fetchAll(), new HttpHeaders(), HttpStatus.OK);
//	}
	
	@PostMapping("/updateplugin/{id}")
	public ResponseEntity<ICIPPlugin> savePluginnew(@RequestBody String updateJson,
			@PathVariable(name = "id") int id) throws URISyntaxException {
		return new ResponseEntity<>(pluginService.updatePlugin(updateJson,id), new HttpHeaders(), HttpStatus.OK);
		}

	/**
	 * Handle all.
	 *
	 * @param ex the ex
	 * @return the response entity
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleAll(Exception ex) {
		logger.error(ex.getMessage(), ex);
		Throwable rootcause = ExceptionUtil.findRootCause(ex);
		return new ResponseEntity<>(new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getMessage(), new HttpHeaders(), new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(), "error occurred").getStatus());
	}

}