package com.infosys.icets.ai.comm.lib.util.rest;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.ai.comm.lib.util.telemetry.domain.OpenTelemetryEvents;
import com.infosys.icets.ai.comm.lib.util.telemetry.domain.TelemetryEvents;
import com.infosys.icets.ai.comm.lib.util.service.TelemetryEventsService;
import com.fasterxml.jackson.databind.ObjectMapper;

//COMMENTED AS PART OF API CLEANUP
//@RestController
//@RequestMapping("/api")
//public class TelemetryEventsRest {
//
//	@Autowired
//	TelemetryEventsService eventService;
//
//	@PostMapping("/v1/telemetry")
//	public ResponseEntity<List<TelemetryEvents>> createEvents(@RequestBody List<Map<String, Object>> payload) {
//		ObjectMapper objectMapper = new ObjectMapper();
//		try {
//			for (Map<String, Object> eventMap : payload) {
//				TelemetryEvents event = eventService.mapToEvent(eventMap);
//				String jsonData = objectMapper.writeValueAsString(eventMap);
//				event.setJson_data(jsonData);
//				eventService.saveEvent(event);
//			}
//		} catch (Exception e) {
//			return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//
//		return new ResponseEntity<>(HttpStatus.CREATED);
//	}
//	
//	@PostMapping("/v1/opentelemetry")
//	public ResponseEntity<?> createTraces(@RequestBody Object payload) {
//		OpenTelemetryEvents trace = null;
//		try {
//			trace = eventService.mapTrace(payload);
//		} catch (Exception e) {
//			return new ResponseEntity<>(e.getMessage(),HttpStatus.INTERNAL_SERVER_ERROR);
//		}
//
//		return new ResponseEntity<>(trace,HttpStatus.CREATED);
//	}
//}
