package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;
import com.lfn.icip.icipwebeditor.model.ICIPMLTools;
import com.lfn.icip.icipwebeditor.repository.ICIPMLToolsRepository;
import com.lfn.icip.icipwebeditor.service.ICIPMLToolsService;

@Service
public class ICIPMLToolsServiceImpl implements ICIPMLToolsService{
	
	private static final Logger logger = LoggerFactory.getLogger(ICIPMLToolsServiceImpl.class);

	@Autowired
	private ICIPMLToolsRepository mltoolsRepository;
	
	@Autowired
	private ICIPEventJobMappingService eventJobMappingService;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(JobLogger.class);
	
	
	private final ObjectMapper objectMapper = new ObjectMapper();
	
	@Override
	public ICIPMLTools saveTool(String org, JSONObject body) {
		ICIPMLTools tool = new ICIPMLTools();
		tool.setCreatedOn(Timestamp.from(Instant.now()));
		tool.setCreatedBy(ICIPUtils.getUser(claim));
		tool.setAlias(body.getString("alias"));
		tool.setName(body.getString("alias"));
		tool.setOrganization(org);
		tool.setDescription(body.optString("description"));
		tool.setCategory(body.getString("category"));
		tool.setToolType(body.getString("toolType"));
		tool.setInputParams(body.optString("inputParams"));
		tool.setOutputParams(body.optString("outputParams"));
		tool.setJsonContent(body.getString("jsonContent"));
		
		return mltoolsRepository.save(tool);
	}
	
	@Override
	public ICIPMLTools updateTool(String name, String org, JSONObject body) {
		ICIPMLTools tool = new ICIPMLTools();
		tool = mltoolsRepository.findMltoolByNameAndOrganization(name, org);
		tool.setAlias(body.optString("alias"));
		tool.setDescription(body.optString("description"));
		tool.setCategory(body.optString("category"));
		tool.setToolType(body.optString("toolType"));
		tool.setInputParams(body.optString("inputParams"));
		tool.setOutputParams(body.optString("outputParams"));
		tool.setJsonContent(body.optString("jsonContent"));
		
		return mltoolsRepository.save(tool);
	}

	@Override
	public List<ICIPMLTools> getAllMlTools(String project, Pageable paginate, String query, List<String> categories) {
		List<ICIPMLTools> mlToolsList;
		mlToolsList = mltoolsRepository.getAllMltoolsByOrg(project, paginate, query);
		if(categories != null && !categories.isEmpty()) {
			List<ICIPMLTools> filteredTools = filterMLToolsByCategories(mlToolsList, categories);
			return filteredTools;
		}else {
			return mlToolsList;
		}
		//		return mltoolsRepository.getAllMltoolsByOrg(project, paginate, query);
	}
	
	@Override
	public List<ICIPMLTools> getAllPaginatedMlTools(String project, Pageable paginate, String query,
			List<String> categories) {
		if (categories != null && !categories.isEmpty()) {
			List<ICIPMLTools> mlToolsList;
			mlToolsList = mltoolsRepository.getAllMltoolsByOrg(project, null, query);
			List<ICIPMLTools> filteredTools = filterMLToolsByCategories(mlToolsList, categories);
			// Applying pagination manually
			int start = (int) paginate.getOffset();
			int end = Math.min((start + paginate.getPageSize()), filteredTools.size());

			if (start > end) {
				return new ArrayList<>();
			}
			return filteredTools.subList(start, end);
		} else {
			return mltoolsRepository.getAllMltoolsByOrg(project, paginate, query);
		}
	}

	public static List<ICIPMLTools> filterMLToolsByCategories(List<ICIPMLTools> toolsList, List<String> categories) {
		Set<ICIPMLTools> uniqueTools = new HashSet<>();

		for (ICIPMLTools tool : toolsList) {
			for (String cat : categories) {
				if (tool.getCategory() != null && tool.getCategory().startsWith("[") && tool.getCategory().contains(cat)) {
					uniqueTools.add(tool);
					break;
				}
			}
		}
		return new ArrayList<>(uniqueTools);
	}
	@Override
	public Long getMLToolsCount(String project, String query, List<String> categories) {
		if (categories != null && !categories.isEmpty()) {
			List<ICIPMLTools> mlToolsList;
			mlToolsList = mltoolsRepository.getAllMltoolsByOrg(project, null, query);
			List<ICIPMLTools> filteredTools = filterMLToolsByCategories(mlToolsList, categories);
			Long count = (long) filteredTools.size();
			return count;
		}
		return mltoolsRepository.getMltoolCountByOrg(project, query);
	}

	@Override
	public ICIPMLTools getMLToolByName(String name, String org) {
		return mltoolsRepository.findMltoolByNameAndOrganization(name, org);
	}

	@Override
	public Boolean checkAlias(String alias, String project) {
		List<ICIPMLTools> mlToolsList = mltoolsRepository.checkAlias(alias,project);
		if(mlToolsList == null || mlToolsList.isEmpty()) {
			return false;
		}
		else if(mlToolsList.size() > 0) {
			return true;
		}
		else {
			return false;
		}
	}

	@Override
	public void deleteMlToolByName(String name, String org) {
//		mltoolsRepository.deleteMlToolByNameAndOrganization(name, org);
		mltoolsRepository.deleteByNameAndOrganization(name, org);
	}

    
	@Override
	public Set<String> getUniqueCategories(String org) {
    	List<ICIPMLTools> tools = mltoolsRepository.getAllMltoolsByOrg(org, null, null);
        Set<String> uniqueCategories = new HashSet<>();
        for (ICIPMLTools tool : tools) {
            try {
                List<String> categories = objectMapper.readValue(tool.getCategory(), List.class);
                uniqueCategories.addAll(categories);
            } catch (Exception e) {
               logger.error(e.getMessage());
            }
        }
        return uniqueCategories;
    }

	@Override
	public JsonObject export(Marker marker, String source, JSONArray toolNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			log.info(marker,"Exporting tools started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			List<ICIPMLTools> tools = new ArrayList<>();
			List<String> mltoolEvent = new ArrayList<>();

			toolNames.forEach(name ->{
				tools.add(mltoolsRepository.findMltoolByNameAndOrganization(name.toString(),source));
				mltoolEvent.add(name.toString()+"Event");
			});
			
			jsnObj.add("mltools", gson.toJsonTree(tools));
			JSONArray toolEventNames = new JSONArray(mltoolEvent);
			jsnObj.add("toolDetails",eventJobMappingService.export(marker, source, toolEventNames));
			
			log.info(marker, "Exported tools successfully");
		}catch(Exception ex) {
			log.error(marker, "Error in exporting tools");
			log.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	@Override
	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			log.info(marker, "Importing tools started");
			
			JsonArray mltools = g.fromJson(jsonObject.get("mltools").toString(), JsonArray.class);
			mltools.forEach(x ->{
				ICIPMLTools tool = g.fromJson(x, ICIPMLTools.class);
				tool.setId(null);
				tool.setOrganization(target);
				try {
					mltoolsRepository.save(tool);
				}catch (DataIntegrityViolationException e) {
					log.error(marker, "Error in importing duplicate tool {}",tool.getName());
				}
			});
			eventJobMappingService.importData(marker, target, jsonObject.getJSONObject("toolDetails"));

		}catch(Exception ex) {
			log.error(marker, "Error in importing tools");
			log.error(marker, ex.getMessage());
		}	
	}

	@Override
	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPMLTools> tools = mltoolsRepository.findByOrganization(fromProjectName);
		tools.stream().forEach(t ->{
			t.setId(null);
			t.setOrganization(toProjectId);
			try {
				mltoolsRepository.save(t);
			}
			catch(Exception ex) {
				log.error("Error in importing duplicate mltools {}",t.getName());
			}
		});
		return true;
	}
}
