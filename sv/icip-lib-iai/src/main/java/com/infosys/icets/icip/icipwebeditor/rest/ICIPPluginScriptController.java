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
package com.infosys.icets.icip.icipwebeditor.rest;

import java.net.URISyntaxException;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPluginScript;
import com.infosys.icets.icip.icipwebeditor.service.IICIPPluginScriptService;
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
@RequestMapping(path = "/${icip.pathPrefix}/pluginscript")
public class ICIPPluginScriptController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPPluginScriptController.class);

	/** The plugin service. */
	@Autowired
	private IICIPPluginScriptService pluginScriptService;
	
	@Autowired
	private IICIPPluginService pluginService;
	/**
	 * Gets the plugin iai.
	 *
	 * @return the plugin iai
	 */
	@GetMapping("/all")
	public ResponseEntity<String> getPluginIai() {
		logger.info("Getting PluginIAI");
		return new ResponseEntity<>(pluginScriptService.fetchAll(), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Gets the plugin.
	 *
	 * @param pluginType the plugin type
	 * @return the plugin
	 */
	@GetMapping("/all/{pluginType}")
	public ResponseEntity<String> getPlugin(@PathVariable(name = "pluginType") String pluginType) {
		logger.info("Getting Plugin type : {}", pluginType);
		return new ResponseEntity<>(pluginScriptService.fetchByType(pluginType), new HttpHeaders(), HttpStatus.OK);
	}

	/**
	 * Save plugin.
	 *
	 * @param script the script
	 * @param pluginName  the plugin name
	 * @param type the type
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/add/{name}/{pluginName}/{type}")
	public ResponseEntity<ICIPPluginScript> savePlugin(@RequestBody String script,
			@PathVariable(name = "name") String name,@PathVariable(name = "pluginName") String pluginName, @PathVariable(name = "type") String type)
			throws URISyntaxException {
		logger.info("Saving plugin : {}", pluginName);
		return new ResponseEntity<>( pluginScriptService.save(name, script, type,pluginName), new HttpHeaders(), HttpStatus.OK);
	}
	
	@PostMapping("/updatescript/{pluginName}")
	public String savePluginnew(@RequestBody String script, @PathVariable(name = "type") String pluginName) throws URISyntaxException {
		
		String result = pluginScriptService.updateScript(pluginName,script);
		logger.info("Saving plugin : {}", pluginName);
		return result;

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