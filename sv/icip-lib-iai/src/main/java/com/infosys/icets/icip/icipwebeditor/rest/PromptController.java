package com.infosys.icets.icip.icipwebeditor.rest;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.protocol.HTTP;
import org.json.JSONObject;
import org.json.simple.JSONValue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.icip.icipwebeditor.service.ICIPPromptChatModel;
import com.infosys.icets.ai.comm.lib.util.ICIPHeaderUtil;
import com.infosys.icets.icip.icipwebeditor.factory.ICIPPromptChatModelFactory;
import com.infosys.icets.icip.icipwebeditor.model.ICIPPrompts;
import com.infosys.icets.icip.icipwebeditor.service.ICIPPromptService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Hidden;

@RestController
@Timed
@Hidden
@RequestMapping(path = "/${icip.pathPrefix}/prompt")
public class PromptController {

	@Autowired
	ICIPPromptService icipPromptService;
	
	@Autowired
	ICIPPromptChatModelFactory chatModelFactory;
	
	@GetMapping("/getAllPrompts")
	public ResponseEntity<List<ICIPPrompts>> getAllPrompts(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "page", required = false, defaultValue = "1") String page,
			@RequestParam(name = "size", required = false, defaultValue = "10") String size,
			@RequestParam(name = "query", required = false) String query
			){
		Pageable paginate = PageRequest.of(Integer.valueOf(page) - 1, Integer.valueOf(size));
		List<ICIPPrompts> promptList= icipPromptService.getAllPrompts(project, paginate,query);
		return new ResponseEntity<>(promptList,HttpStatus.OK);
	}
	
	@GetMapping("/getPromptsCount")
	public ResponseEntity<Long> getPromptsCount(
			@RequestParam(name = "project", required = true) String project,
			@RequestParam(name = "query", required = false) String query
			){
		Long results= icipPromptService.getPromptsCount(project,query);
		return ResponseEntity.status(200).body(results);
	}
	
	@GetMapping("/getPrompts/{id}")
	public ResponseEntity<ICIPPrompts> getPromptById(@PathVariable(name = "id") Integer id){
		ICIPPrompts promptList= icipPromptService.getPromptById(id);
		return new ResponseEntity<>(promptList,HttpStatus.OK);
	}
	
	@GetMapping("/getPromptByNameAndOrg/{name}/{org}")
	public ResponseEntity<ICIPPrompts> getPromptByNameAndOrg(@PathVariable(name = "name") String name,
			@PathVariable(name = "org") String org){
		ICIPPrompts prompt= icipPromptService.getPromptByNameAndOrg(name, org);
		return new ResponseEntity<>(prompt,HttpStatus.OK);
	}
	
	@PostMapping( "/save")
	public ResponseEntity<ICIPPrompts> save(@RequestBody String body ){
		JSONObject jsonObject= new JSONObject(body);
		ICIPPrompts prompt = icipPromptService.save(jsonObject);
		return new ResponseEntity<>(prompt,HttpStatus.OK);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<ICIPPrompts> deletebyId(@PathVariable(name = "id") Integer id){
		
		icipPromptService.deleteById(id);
		return ResponseEntity.ok().headers(ICIPHeaderUtil.createEntityDeletionAlert("Prompt", id.toString()))
				.build();
	}
	
	@PostMapping("/update/{id}")
	public ResponseEntity<ICIPPrompts> updateByID(@PathVariable(name = "id") Integer id,
													@RequestBody String body){
		JSONObject jsonObject= new JSONObject(body);
		ICIPPrompts prompt = icipPromptService.updateByID(id,jsonObject);
		return new ResponseEntity<>(prompt,HttpStatus.OK);
	}
	
	@PostMapping("/postPrompt")
    public ResponseEntity<String> postPromptToModel(@RequestBody String body) throws InterruptedException, InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException, URISyntaxException, IOException {
		JSONObject jsonObject= new JSONObject(body);
		String type=jsonObject.getString("type")+"chatmodel";
		ICIPPromptChatModel chatModel= chatModelFactory.getpromptchatModelobject(type);
		return new ResponseEntity<>(chatModel.postPromptToModel(jsonObject), HttpStatus.OK);
	}
	
	@PostMapping("/executeworkflow")
	public ResponseEntity<String> executeWorkflow(@RequestBody String body) throws InterruptedException, InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException, URISyntaxException, IOException {
		JSONObject jsonObject = new JSONObject(body);
		String result = icipPromptService.executeWorkflow(jsonObject);
		return new ResponseEntity<>(result, HttpStatus.OK);
	}
	
	@PostMapping("/postPromptFromEndpoint")
    public ResponseEntity<String> postPromptFromEndpoint(@RequestBody String body,
    			@RequestParam (name = "rest_provider") String restProvider,
    			@RequestParam (name = "org") String org) throws InterruptedException, InvalidKeyException, KeyManagementException, NoSuchAlgorithmException, KeyStoreException, URISyntaxException, IOException {
		JSONObject jsonObject= new JSONObject(body);
		ICIPPromptChatModel chatModel= chatModelFactory.getpromptchatModelobject("restchatmodel");
		return new ResponseEntity<>(chatModel.postPromptFromEndpoint(jsonObject, restProvider, org), HttpStatus.OK);
	}

	@GetMapping("/getBedrockModels")
		public List<String> getAllModelTypeofBedrock(){
			List<String> listofModels= new ArrayList<>();
			listofModels.add("Anthropic");
			listofModels.add("Meta-Llama");
			listofModels.add("AI21");
			listofModels.add("Mistral");
			listofModels.add("Titan");
			listofModels.add("Cohere");
			return listofModels;
		}

	@GetMapping("/getPromptsList/{project}")
	public ResponseEntity<List<ICIPPrompts>> getPromptsList(
			@PathVariable(name = "project") String project
			){
		List<ICIPPrompts> promptList= icipPromptService.getPromptsListByOrg(project);
		return new ResponseEntity<>(promptList,HttpStatus.OK);
	}
	
	@PostMapping("/saveAsExample/{id}")
	public ResponseEntity<ICIPPrompts> saveExampleByID(@PathVariable(name = "id") Integer id,
													@RequestBody String body){
		JSONObject jsonObject= new JSONObject(body);
		ICIPPrompts prompt = icipPromptService.saveExampleByID(id,jsonObject);
		return new ResponseEntity<>(prompt,HttpStatus.OK);
	}
}
