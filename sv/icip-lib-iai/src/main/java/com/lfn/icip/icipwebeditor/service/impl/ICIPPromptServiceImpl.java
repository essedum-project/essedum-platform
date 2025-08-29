package com.lfn.icip.icipwebeditor.service.impl;

import java.io.IOException;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.service.IICIPDatasourceService;
import com.lfn.icip.icipwebeditor.job.quartz.model.QrtzTriggers;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorker;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerLogs;
import com.lfn.icip.icipwebeditor.model.ICIPPrompts;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.repository.ICIPPrompRepository;
import com.lfn.icip.icipwebeditor.service.ICIPMLAIWorkerConfigService;
import com.lfn.icip.icipwebeditor.service.ICIPMLAIWorkerLogsService;
import com.lfn.icip.icipwebeditor.service.ICIPMLAIWorkerService;
import com.lfn.icip.icipwebeditor.service.ICIPPromptService;
import com.lfn.icip.icipwebeditor.service.IICIPEventJobMappingService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;

@Service
public class ICIPPromptServiceImpl implements ICIPPromptService{

	/** The Constant joblogger. */
	private static final Logger logger = LoggerFactory.getLogger(JobLogger.class);
	
	@Autowired
	private ICIPPrompRepository icipPrompRepository;
	
	@Autowired
	private ICIPMLAIWorkerService mlaiworkerService;
	
	@Autowired
	private ICIPMLAIWorkerConfigService mlaiworkerConfigService;
	
	@Autowired
	private IICIPStreamingServiceService streamingServicesService;
	
	@Autowired
	private ICIPMLAIWorkerLogsService aiWorkerLogsService;
	
	@Autowired
	private IICIPEventJobMappingService eventMappingService;
	
	@Autowired
	private IICIPDatasourceService iICIPDatasourceService;
	
	@Autowired
	private ICIPPipelineService pipelineService;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	/** The ncs. */
	private NameEncoderService ncs;
	
	public ICIPPromptServiceImpl(ICIPPrompRepository icipPrompRepository,NameEncoderService ncs) {
		super();
		this.icipPrompRepository=icipPrompRepository;
		this.ncs=ncs;
	}

	
	@Override
	public List<ICIPPrompts> getAllPrompts(String project, Pageable paginate,String query) {
		
//		return icipPrompRepository.findAll();
		return icipPrompRepository.getAllPromptsByOrg(project, paginate, query);

	}
	public Long getPromptsCount(String project, String query)
 {
//		return icipPrompRepository.findAll();
		Long count = icipPrompRepository.getPromptsCountByOrg(project, query);
		return count;
	}
	@Override
	public ICIPPrompts save(JSONObject body) {
		ICIPPrompts prompt = new ICIPPrompts();
		prompt.setCreatedby(ICIPUtils.getUser(claim));
		prompt.setCreatedon(Timestamp.from(Instant.now()));
		prompt.setAlias(body.getString("alias"));
		prompt.setName(body.getString("alias"));
		prompt.setOrganization(body.getString("organization"));
		prompt.setProviders(body.get("providers").toString());
		JSONArray inputArray = new JSONArray(body.get("inputs").toString());
		JSONArray templateArray = new JSONArray(body.get("prompt").toString());
//		prompt.setAlias(body.getAlias());
//		prompt.setName(body.getAlias());
//		prompt.setOrganization(body.getOrganization());
//		prompt.setProviders(body.getProviders());
//		JSONArray inputArray = new JSONArray(body.getInputs());
//		JSONArray templateArray = new JSONArray(body.getPrompt());
		JSONArray tempArray = new JSONArray();
		JSONArray examplesArray = new JSONArray();

		JSONObject final_json = new JSONObject();
		for(int i = 0; i < templateArray.length(); i++)
		{
		      JSONObject obj = templateArray.getJSONObject(i);
		      JSONObject tempobj = new JSONObject();
		      
		        // Adding key-value pairs to the object
		      tempobj.put("templateid", "sampleTempDiv-" + (i+1));
		      tempobj.put("templatevalue", obj.getString("type"));
		      tempobj.put("templatetext", obj.getString("text"));
		      tempArray.put(tempobj);
		      
		}
		final_json.put("templates", tempArray);
		final_json.put("inputs", inputArray);
		final_json.put("examples",examplesArray);
		prompt.setJson_content(final_json.toString());

//		
//		if (body.getName() == null || body.getName().trim().isEmpty()) {
//			body.setName(body.getAlias());
//		}
		
		return icipPrompRepository.save(prompt);
		
	}

	@Override
	public void deleteById(Integer id) {
		 icipPrompRepository.deleteById(id);
	}




	@Override
	public ICIPPrompts updateByID(Integer id, JSONObject body) {
		ICIPPrompts prompt = icipPrompRepository.findById(id).get();
		prompt.setCreatedby(ICIPUtils.getUser(claim));
		prompt.setCreatedon(Timestamp.from(Instant.now()));
		prompt.setAlias(body.getString("alias"));
		prompt.setName(body.getString("alias"));
		prompt.setOrganization(body.getString("organization"));
		prompt.setProviders(body.get("providers").toString());
		JSONArray inputArray = new JSONArray(body.get("inputs").toString());
		JSONArray templateArray = new JSONArray(body.get("prompt").toString());
		JSONArray examplesArray = new JSONArray(body.get("examples").toString());
		//		prompt.setAlias(body.getAlias());
//		prompt.setName(body.getAlias());
//		prompt.setOrganization(body.getOrganization());
//		prompt.setProviders(body.getProviders());
//		JSONArray inputArray = new JSONArray(body.getInputs());
//		JSONArray templateArray = new JSONArray(body.getPrompt());
		JSONArray tempArray = new JSONArray();

		JSONObject final_json = new JSONObject();
		for(int i = 0; i < templateArray.length(); i++)
		{
		      JSONObject obj = templateArray.getJSONObject(i);
		      JSONObject tempobj = new JSONObject();
		      
		        // Adding key-value pairs to the object
		      tempobj.put("templateid", "sampleTempDiv-" + (i+1));
		      tempobj.put("templatevalue", obj.getString("type"));
		      tempobj.put("templatetext", obj.getString("text"));
		      tempArray.put(tempobj);
		      
		}
		final_json.put("templates", tempArray);
		final_json.put("inputs", inputArray);
		final_json.put("examples",examplesArray);
		prompt.setJson_content(final_json.toString());

			return icipPrompRepository.save(prompt);
	}
	
	@Override
	public ICIPPrompts saveExampleByID(Integer id, JSONObject body) {
		ICIPPrompts prompt = icipPrompRepository.findById(id).get();
		prompt.setCreatedby(ICIPUtils.getUser(claim));
		prompt.setCreatedon(Timestamp.from(Instant.now()));
		prompt.setAlias(body.getString("alias"));
		prompt.setName(body.getString("alias"));
		prompt.setOrganization(body.getString("organization"));
		prompt.setProviders(body.get("providers").toString());
		JSONArray inputArray = new JSONArray(body.get("inputs").toString());
		JSONArray templateArray = new JSONArray(body.get("prompt").toString());
		JSONArray examplesArray = new JSONArray(body.get("examples").toString());
		JSONObject prompt_json = new JSONObject(prompt.getJson_content());
		JSONArray inputArrayOld = new JSONArray(prompt_json.get("inputs").toString());
//		prompt.setAlias(body.getAlias());
//		prompt.setName(body.getAlias());
//		prompt.setOrganization(body.getOrganization());
//		prompt.setProviders(body.getProviders());
//		JSONArray inputArray = new JSONArray(body.getInputs());
//		JSONArray templateArray = new JSONArray(body.getPrompt());
		JSONArray tempArray = new JSONArray();

		JSONObject final_json = new JSONObject();
		for(int i = 0; i < templateArray.length(); i++)
		{
		      JSONObject obj = templateArray.getJSONObject(i);
		      JSONObject tempobj = new JSONObject();
		      
		        // Adding key-value pairs to the object
		      tempobj.put("templateid", "sampleTempDiv-" + (i+1));
		      tempobj.put("templatevalue", obj.getString("type"));
		      tempobj.put("templatetext", obj.getString("text"));
		      tempArray.put(tempobj);
		      
		}
		final_json.put("templates", tempArray);
//		final_json.put("inputs", inputArray);
		final_json.put("inputs", inputArrayOld);
		final_json.put("examples",examplesArray);
		prompt.setJson_content(final_json.toString());

			return icipPrompRepository.save(prompt);
	}


	@Override
	public ICIPPrompts getPromptById(Integer id) {
		return icipPrompRepository.findById(id).get();
	}
	
	@Override
	public ICIPPrompts getPromptByNameAndOrg(String name, String org) {
		// TODO Auto-generated method stub
		return icipPrompRepository.findByNameAndOrganization(name,org);
	}
	
	@Override
	public List<ICIPPrompts> getPromptsListByOrg(String project) {
		// TODO Auto-generated method stub
		return icipPrompRepository.findAllByOrganization(project);
	}
	
	@Override
	public JsonObject export(Marker marker, String source, JSONArray promtNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			logger.info(marker,"Exporting prompts started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
			List<ICIPPrompts> prompts = new ArrayList<>();
			promtNames.forEach(alias -> {
				prompts.add(icipPrompRepository.findByAliasAndOrganization(alias.toString(), source));
			});
			jsnObj.add("mlprompts", gson.toJsonTree(prompts));
			logger.info(marker, "Exported promts successfully");
		}
		catch(Exception e) {
			logger.error(marker, "Error in exporting prompts");
			logger.error(marker, e.getMessage());
		}
		return jsnObj;
	}
	
	@Override
	public void importData(Marker marker, String target, JSONObject jsonObject) {
		Gson g = new Gson();
		try {
			logger.info(marker, "Importing prompts started");
			JsonArray prompts = g.fromJson(jsonObject.get("mlprompts").toString(), JsonArray.class);
			prompts.forEach(x -> {
				ICIPPrompts prompt = g.fromJson(x, ICIPPrompts.class);
				if(prompt != null) {
					ICIPPrompts isPresent = icipPrompRepository.findByNameAndOrganization(prompt.getName(), target);
					prompt.setOrganization(target);
					prompt.setId(null);
				
					try {
						if(isPresent == null)
							icipPrompRepository.save(prompt);
					}
					catch(Exception e) {
						logger.error(marker, "Error in importing - duplicate prompt {}",prompt.getAlias());
					}
				}
			});
			logger.info(marker, "Imported prompts successfully");
		}
		catch(Exception ex) {
			logger.error(marker, "Error in importing exporting");
			logger.error(marker, ex.getMessage());
		}
	}
	
	@Override
	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPPrompts> promptList = icipPrompRepository.findAllByOrganization(fromProjectName);
		promptList.stream().forEach(p -> {
			ICIPPrompts prompt = icipPrompRepository.findByAliasAndOrganization(p.getAlias(),fromProjectName);
			try {
			p.setId(null);
			p.setOrganization(toProjectId);
			icipPrompRepository.save(p);
			}
			catch (Exception e) {
				logger.error("Error in ICIPPrompt Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}
	
	@Override
	public String executeWorkflow(JSONObject jsonObject) {
		String result = "";
		try {
			String taskName = jsonObject.getString("taskName");
			String workerName = jsonObject.getString("workerName");
			String organization = jsonObject.getString("organization");
			JSONObject context = jsonObject.getJSONObject("inputs");
			String runtime = jsonObject.getString("runtime");
			
			String dsrcAlias = runtime.substring(runtime.indexOf("-")+1);
			ICIPDatasource datasource = iICIPDatasourceService.findAllByAliasAndOrganization(dsrcAlias, organization);

			ICIPMLAIWorkerConfig config = mlaiworkerConfigService.getAiWorkerConfigByNameAndOrg(workerName, organization);
			if(config == null) {
				result = "No worker available with name:" + workerName;
			}
			else {
				JSONObject executorJson = new JSONObject(config.getExecutor());
				String executionPipeline = executorJson.getString("pipeline");
				ICIPStreamingServices pipelineData = streamingServicesService.getICIPStreamingServices(executionPipeline, organization);
				List<ICIPMLAIWorker> worker = mlaiworkerService.getAiWorkerByNameAndOrgAndTask(workerName, organization, taskName);
				
				ICIPMLAIWorker selectedVersion = worker.stream()
                        .filter(work -> work.getIsdefault())
                        .findFirst()
                        .orElse(
                        		worker.stream()
                        		.sorted(Comparator.comparing(ICIPMLAIWorker::getCreatedon)
                        				.reversed())
                        		.collect(Collectors.toList())
                        		.get(0));
				
				JSONObject logsBody = new JSONObject();
				logsBody.put("task",taskName);
				logsBody.put("worker",config.getName());
				logsBody.put("context",context.toString());
				logsBody.put("runtime",runtime);
				logsBody.put("runtimeDsrc",datasource.getName());
				logsBody.put("organization",organization);
				ICIPMLAIWorkerLogs aiWorkerLog = aiWorkerLogsService.saveLog(organization, logsBody);
				
				String workerlogId = aiWorkerLog.getUid();
				JSONArray env = new JSONArray();
				JSONArray taskGroup = new JSONArray(config.getTaskGroup());
				
				taskGroup.forEach(e->{
					
					JSONObject task = (JSONObject) e;
					if(task.getString("taskName").equalsIgnoreCase(taskName)) {
						env.put(new JSONObject().put("name", "bots").put("value", task.getJSONArray("bots").toString()));
					}
				});
				
		        env.put(new JSONObject().put("name", "workflow").put("value", selectedVersion.getWorkflowSteps().toString()));
		        env.put(new JSONObject().put("name", "inputs").put("value", context.toString()));
		        env.put(new JSONObject().put("name", "workerlogId").put("value", workerlogId));
		        
		        JSONObject pipelineJson = new JSONObject(pipelineData.getJsonContent());
		        pipelineJson.remove("environment"); 
		        pipelineJson.put("environment", env);
		        pipelineData.setJsonContent(pipelineJson.toString());
		        
		        streamingServicesService.update(pipelineData);
				String path = streamingServicesService.savePipelineJson(pipelineData.getName(), organization, pipelineJson.toString());
				
				JSONObject evtBody = new JSONObject();
				evtBody.put("pipelineName", pipelineData.getName());
				evtBody.put("scriptPath", path);
				
				String eventName = "generateScript_" + pipelineData.getType();
				JSONObject payload = new JSONObject();
				payload.put("org", organization);
				payload.put("datasourceName", datasource.getName());
				
				eventMappingService.trigger(eventName, organization, "", payload.toString(), datasource.getName());
				String corelid = ICIPUtils.generateCorrelationId();
				Integer offset = new Date().getTimezoneOffset();
				ResponseEntity<?> response = pipelineService.createJob("DragAndDrop", pipelineData.getName(), pipelineData.getAlias(), organization, 
						runtime.substring(0,runtime.indexOf("-")), "generated", corelid, offset, datasource.getName(), workerlogId);
				if(response.getBody().toString() != null) {
					result = response.getBody().toString();
				}
				else {
					result = "Workflow Execution Failed";
				}
			}
		}
		catch(Exception ex) {
			logger.error(ex.getMessage());
			result = "Can not execute workflow";
		}
		return result;
	}
}
