package com.lfn.icip.icipwebeditor.job.service.util;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.icip.icipwebeditor.model.ICIPPlugin;
import com.lfn.icip.icipwebeditor.repository.ICIPPluginRepository;
import com.lfn.icip.icipwebeditor.service.IICIPPluginService;

import lombok.extern.log4j.Log4j2;


@Component("generatedjob")
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
@RefreshScope

/** The Constant log. */
@Log4j2
public class ICIPJobServiceUtilGenerated {
	
	@Autowired
	private IICIPPluginService pluginService;
	
	@Autowired
	private ConstantsService constantsService;
	
	@Autowired
	private ICIPPluginRepository pluginRepository;

	@Autowired
	@Lazy
	private ICIPInitializeAnnotationServiceUtil annotationServiceUtil;


	public List<String> getCommand(String type, String name,String org) {
		JsonParser parser = new JsonParser();
		List<String> response = new ArrayList<String>();
		ICIPPlugin plugin = pluginRepository.getByTypeAndOrg(type,org);
//		String plugin = pluginService.fetchByType(type);
		Map<String, String> map = new HashMap<>();

//		JsonElement pluginJson  = parser.parse(plugin.toString());
//		String config = pluginJson.getAsJsonObject().get("configData").getAsString();
		String config = plugin.getConfig().toString();
		config = config.substring(1, config.length()-1);
		JsonObject configJson = parser.parse(config.toString()).getAsJsonObject();
		JsonArray commands = configJson.get("commands").getAsJsonArray();
		JsonObject environment = configJson.get("environment").getAsJsonObject();
		
		List<String> list = annotationServiceUtil.getEnvironments();
		list.forEach(kv -> {
			String[] keyValue = kv.split("=", 2);
			environment.addProperty(keyValue[0], keyValue[1]);
		});
		commands.forEach(command ->{
//			String cmd = new String();
			String cmd = command.getAsString();

			for(Map.Entry<String, JsonElement> entry : environment.entrySet()) {
			    if(cmd.contains(entry.getKey().substring(1, entry.getKey().length()-1))) {
			    	cmd = cmd.replaceAll("@!"+entry.getKey()+"!@", entry.getValue().getAsString());
			    }
				
			}
			cmd = cmd.replaceAll("@!pipelinename!@", name);
			while(cmd.contains("@!")) {
				
			String remain = cmd.substring(cmd.indexOf("@!")+2, cmd.lastIndexOf("!@"));
			String constant = constantsService.findByKeys(remain, "Core");
			cmd = cmd.replaceAll("@!"+remain+"!@", constant);
	
			}
			response.add(cmd);
		});
		return response;
	}
}
