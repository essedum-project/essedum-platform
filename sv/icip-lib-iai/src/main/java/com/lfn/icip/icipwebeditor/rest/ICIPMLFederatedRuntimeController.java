package com.lfn.icip.icipwebeditor.rest;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.hibernate.internal.build.AllowSysOut;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
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
import org.springframework.web.client.RestTemplate;

import com.lfn.icip.dataset.model.ICIPDatasource;
import com.lfn.icip.dataset.model.dto.ICIPDatasourceDTO;
import com.lfn.icip.icipwebeditor.exception.AddRuntimeException;
import com.lfn.icip.icipwebeditor.model.AssignRuntime;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedRuntime;
import com.lfn.icip.icipwebeditor.model.ICIPMLFederatedRuntimeModel;
import com.lfn.icip.icipwebeditor.model.PortPayload;
import com.lfn.icip.icipwebeditor.model.ValidatePorts;
import com.lfn.icip.icipwebeditor.model.dto.ICIPRuntimeParams;
import com.lfn.icip.icipwebeditor.repository.ICIPMLFederatedRuntimeRepository;
import com.lfn.icip.icipwebeditor.service.impl.ICIPMLFederatedRuntimeService;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

@RestController
@RequestMapping("/${icip.pathPrefix}/runtime")
public class ICIPMLFederatedRuntimeController {

	@Autowired
	ICIPMLFederatedRuntimeService federatedRuntimeService;

	@PostMapping("ports/validateports")
	public String validatePorts(@RequestBody PortPayload validateport) {

		System.out.println(validateport);
		return "Ports Validated";
	}

	@PostMapping("/addports")
	public ResponseEntity<Map<String, String>> runtime(@RequestBody PortPayload portPayload) throws Exception {
		System.out.println(portPayload);
		ICIPRuntimeParams runtimeParams = new ICIPRuntimeParams();
		runtimeParams.setConnectionId(portPayload.getDatasourceid());
		runtimeParams.setOrganization(portPayload.getOrganization());
		if (portPayload.isExiPort()) {

			if (portPayload.isDefaultPort()) {
				Integer defaultconnexiportStartRange = 3051;
				Integer defaultconnexiportEndRange = 3063;
				Integer defaultexiPortRange = 8091;
				Integer defaultexiEndRange = 8103;
				runtimeParams.setPortStartRange(defaultconnexiportStartRange);
				runtimeParams.setPortEndRange(defaultconnexiportEndRange);
				runtimeParams.setExiportStartRange(defaultexiPortRange);
				runtimeParams.setExiportEndRange(defaultexiEndRange);
				federatedRuntimeService.addPorts(runtimeParams, portPayload);
			} else {
				runtimeParams.setPortStartRange(Integer.parseInt(portPayload.getStartport()));
				runtimeParams.setExiportStartRange(Integer.parseInt(portPayload.getExistartport()));
				runtimeParams.setExiportEndRange(Integer.parseInt(portPayload.getExiendport()));
				runtimeParams.setPortEndRange(Integer.parseInt(portPayload.getEndport()));
				federatedRuntimeService.addPorts(runtimeParams, portPayload);

			}

		} else {
			if (portPayload.isDefaultPort()) {
				Integer defaultportStartRange = 8090;
				Integer defaultportEndRange = 8115;
				runtimeParams.setPortStartRange(defaultportStartRange);
				runtimeParams.setPortEndRange(defaultportEndRange);
				federatedRuntimeService.addPorts(runtimeParams, portPayload);

			} else {
				runtimeParams.setPortEndRange(Integer.parseInt(portPayload.getEndport()));
				runtimeParams.setPortStartRange(Integer.parseInt(portPayload.getStartport()));
				federatedRuntimeService.addPorts(runtimeParams, portPayload);
			}

		}
		return ResponseEntity.ok(Map.of("response", "Ports are Assigned Successfully"));
	}

	@PostMapping("/editports")
	public ResponseEntity<Map<String, String>> editruntime(@RequestBody PortPayload portPayload) throws Exception {

		ICIPRuntimeParams runtimeParams = new ICIPRuntimeParams();
		runtimeParams.setConnectionId(portPayload.getDatasourceid());
		runtimeParams.setOrganization(portPayload.getOrganization());
		if (portPayload.isExiPort()) {

			if (portPayload.isDefaultPort()) {
				Integer defaultconnexiportStartRange = 3051;
				Integer defaultconnexiportEndRange = 3063;
				Integer defaultexiPortRange = 8091;
				Integer defaultexiEndRange = 8103;
				runtimeParams.setPortStartRange(defaultconnexiportStartRange);
				runtimeParams.setPortEndRange(defaultconnexiportEndRange);
				runtimeParams.setExiportStartRange(defaultexiPortRange);
				runtimeParams.setExiportEndRange(defaultexiEndRange);
				federatedRuntimeService.editPortforDatas(runtimeParams, portPayload);
			} else {
				runtimeParams.setPortStartRange(Integer.parseInt(portPayload.getStartport()));
				runtimeParams.setExiportStartRange(Integer.parseInt(portPayload.getExistartport()));
				runtimeParams.setExiportEndRange(Integer.parseInt(portPayload.getExiendport()));
				runtimeParams.setPortEndRange(Integer.parseInt(portPayload.getEndport()));
				federatedRuntimeService.editPortforDatas(runtimeParams, portPayload);

			}

		} else {
			if (portPayload.isDefaultPort()) {
				Integer defaultportStartRange = 8090;
				Integer defaultportEndRange = 8115;
				runtimeParams.setPortStartRange(defaultportStartRange);
				runtimeParams.setPortEndRange(defaultportEndRange);
				federatedRuntimeService.editPortforDatas(runtimeParams, portPayload);

			} else {
				runtimeParams.setPortEndRange(Integer.parseInt(portPayload.getEndport()));
				runtimeParams.setPortStartRange(Integer.parseInt(portPayload.getStartport()));
				federatedRuntimeService.editPortforDatas(runtimeParams, portPayload);
			}

		}
		return ResponseEntity.ok(Map.of("response", "Ports are Assigned Successfully"));
	}

	@PostMapping("/validateport")
	public ResponseEntity<Map<String, List<Integer>>> validatePorts(@RequestBody ValidatePorts validatePorts) {
		List<Integer> response = federatedRuntimeService.validatePorts(validatePorts);
		if (response.size() == 0) {
			return new ResponseEntity<>(Map.of("available_ports", response), HttpStatus.BAD_REQUEST);
		}
		return new ResponseEntity<>(Map.of("available_ports", response), HttpStatus.OK);
	}

	@PutMapping("/assign")
	public ResponseEntity<Map<String, String>> assignRuntimeToPipeline(@RequestBody AssignRuntime assignRuntime) {
		Map<String, String> response = federatedRuntimeService.assignRuntime(assignRuntime);
		return new ResponseEntity<>(response, HttpStatus.OK);
	}

	@GetMapping("/getPaginated-runtime")
	public Page<ICIPMLFederatedRuntime> getProducts(@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "4") int size, @RequestParam(defaultValue = "id") String sortBy) {

		Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
		return federatedRuntimeService.getSortedPaginatedRuntime(pageable);
	}

	@GetMapping("/get-runtime")
	public ResponseEntity<ICIPMLFederatedRuntime> getRuntimeById(@RequestParam Integer id) {

		ICIPMLFederatedRuntime getRuntime = federatedRuntimeService.getRuntime(id);
		return ResponseEntity.ok(getRuntime);

	}

	@GetMapping("/get/connection")
	public ResponseEntity<Map<String, Object>> getConnection(@RequestParam Integer connid) {

		Map<String, Object> getRuntime = federatedRuntimeService.getConnectionId(connid);
		return ResponseEntity.ok(getRuntime);

	}

	@GetMapping("/get/available-ports")
	public ResponseEntity<Map<String, Object>> getAvailablePorts(@RequestParam("connid") Integer connid) {

		Map<String, Object> getAvailablePorts = federatedRuntimeService.getPorts(connid);
		return ResponseEntity.ok(getAvailablePorts);

	}

	@GetMapping("/getAll-runtime")
	public ResponseEntity<List<ICIPMLFederatedRuntime>> getRuntimeList() {
		return new ResponseEntity<>(federatedRuntimeService.getRuntimeList(), HttpStatus.OK);
	}

	@GetMapping("/search")
	public ResponseEntity<List<ICIPMLFederatedRuntime>> getRuntimeBySearch(@RequestParam(required = false) Integer id,
			@RequestParam(required = false) Integer connid, @RequestParam(required = false) Integer connport,
			@RequestParam(required = false) Boolean isEXIPorts, @RequestParam(required = false) Integer exiPorts,
			@RequestParam(required = false) Integer pipelineid, @RequestParam(required = false) Integer appid,
			@RequestParam(required = false) Integer connendpoint, @RequestParam(required = false) Boolean isAssigned) {

		List<ICIPMLFederatedRuntime> result = federatedRuntimeService.findBySearch(id, connid, connport, isEXIPorts,
				exiPorts, pipelineid, appid, connendpoint, isAssigned);
		return new ResponseEntity(result, HttpStatus.OK);

	}

	@GetMapping("/isAssigned")
	public ResponseEntity<Map<String, String>> isRuntimeAssignedToPipeline(@RequestParam Integer pipeline_id) {
		Map<String, String> icpl = federatedRuntimeService.assignedRuntime(pipeline_id);
		return ResponseEntity.ok(icpl);
	}

	@PutMapping("/release")
	public ResponseEntity<String> releasePort(@RequestParam Integer pipelineid) {

		try {
			federatedRuntimeService.releasePort(pipelineid);
			return new ResponseEntity<>("Successfully Released the port", HttpStatus.OK);
		} catch (Exception e) {
			e.getMessage();
			return new ResponseEntity<>("Error" + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	@DeleteMapping("/delete/{name}/{org}")
	public Map<String, String> deletePort(@PathVariable String name, @PathVariable String org) {
		String s = null;
		try {
			s = federatedRuntimeService.deletePorts(name, org);
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return Map.of("Deleted", s);
	}

	@GetMapping("/access-url")
	public Map<String, String> displayAccessUrl(@RequestParam String pipelineName) {
		String accessUrl = federatedRuntimeService.getAccessUrl(pipelineName);
		return Map.of("accessUrl", accessUrl);
	}

}
