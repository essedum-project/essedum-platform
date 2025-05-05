package com.infosys.icets.ai.comm.lib.util.service.impl;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.json.JSONObject;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.telemetry.domain.OpenTelemetryEvents;
import com.infosys.icets.ai.comm.lib.util.telemetry.domain.TelemetryEvents;
//import com.infosys.icets.ai.comm.lib.util.telemetry.repository.OpenTelemetryEventsRepository;
//import com.infosys.icets.ai.comm.lib.util.telemetry.repository.TelemetryEventsRepository;
import com.infosys.icets.ai.comm.lib.util.service.TelemetryEventsService;

//COMMENTED AS PART OF API CLEANUP

//@Service
//@Transactional
//public class TelemetryEventsServiceImpl implements TelemetryEventsService {
//
//	private final org.slf4j.Logger log = LoggerFactory.getLogger(TelemetryEventsServiceImpl.class);
//
//	@Autowired
//	TelemetryEventsRepository eventRepository;
//	
//	@Autowired
//	OpenTelemetryEventsRepository tracesRepository;
//
//	@Override
//	public TelemetryEvents saveEvent(TelemetryEvents event) {
//		if (eventRepository.existsByEidAndEtsAndMidAndActorIdAndActorType(event.getEid(), event.getEts(),
//				event.getMid(), event.getActor_id(), event.getActor_type())) {
//			return null;
//		}
//		event.setEts_datetime(EpochTimeConverter(event.getEts()));
//		TelemetryEvents events = eventRepository.saveAndFlush(event);
//		List<TelemetryEvents> duplicates = eventRepository.findByMid(event.getMid());
//		if (duplicates.size() > 1) {
//			for (int i = 0; i < duplicates.size() - 1; i++) {
//				TelemetryEvents duplicateEvent = duplicates.get(i);
//				try {
//					eventRepository.deleteById(duplicateEvent.getId());
//				} catch (Exception e) {
//					log.error("Error deleting duplicate events: {}", e.getMessage());
//				}
//			}
//		}
//		return events;
//	}
//
//	@Override
//	public TelemetryEvents mapToEvent(Map<String, Object> eventMap) {
//		TelemetryEvents event = new TelemetryEvents();
//		event.setEid((String) eventMap.get("eid"));
//		event.setEts(Long.parseLong(eventMap.get("ets").toString()));
//		event.setVer((String) eventMap.get("ver"));
//		event.setMid((String) eventMap.get("mid"));
//
//		Map<String, Object> actorMap = (Map<String, Object>) eventMap.get("actor");
//		if (actorMap != null) {
//			event.setActor_id((String) actorMap.get("id"));
//			event.setActor_type((String) actorMap.get("type"));
//			;
//		}
//
//		Map<String, Object> contextMap = (Map<String, Object>) eventMap.get("context");
//		if (contextMap != null) {
//			event.setContext_channel((String) contextMap.get("channel"));
//			;
//
//			Map<String, Object> pdataMap = (Map<String, Object>) contextMap.get("pdata");
//			if (pdataMap != null) {
//				event.setContext_pdata_id((String) pdataMap.get("id"));
//				event.setContext_pdata_ver((String) pdataMap.get("ver"));
//				event.setContext_pdata_pid((String) pdataMap.get("pid"));
//			}
//		}
//
//		Map<String, Object> objectMap = (Map<String, Object>) eventMap.get("object");
//		if (objectMap != null) {
//			event.setObject_id((String) objectMap.get("id"));
//			event.setObject_ver((String) objectMap.get("ver").toString());
//		}
//
//		Map<String, Object> edataMap = (Map<String, Object>) eventMap.get("edata");
//		System.out.println(edataMap);
//		if (edataMap != null) {
//			event.setEdata_type((String) edataMap.get("type"));			
//			event.setEdata_pageid((String) edataMap.get("pageid"));
//			event.setEdata_stageto((String) edataMap.get("stageto"));
//			
//			if (edataMap.get("duration") != null) {
//				event.setEdata_duration(Double.parseDouble(edataMap.get("duration").toString()));
//			}
//			if (edataMap.get("subType") != null) {
//				event.setEdata_subType((String) edataMap.get("subType"));
//			}
//			if (edataMap.get("id") != null) {
//				event.setEdata_id((String) edataMap.get("id"));
//			}
////			if (edataMap.get("prevstate") != null) {
////				event.setEdata_prevstate((String) edataMap.get("prevstate"));
////			}
//		}
//
//		return event;
//	}
//
//	public LocalDateTime EpochTimeConverter(Long ets) {
//		LocalDateTime date = Instant.ofEpochMilli(ets).atZone(ZoneId.systemDefault()).toLocalDateTime();
//		return date;
//	}
//
//	@Override
//	public OpenTelemetryEvents saveTrace(OpenTelemetryEvents trace) {
//		OpenTelemetryEvents result = tracesRepository.save(trace);
//		return result;
//	}
//	
//	@SuppressWarnings({ "unchecked", "rawtypes" })
//	@Override
//	public OpenTelemetryEvents mapTrace(Object payload) {
//		List resourceSpans = ((Map<String,List>) payload).get("resourceSpans");
//		List scopeSpans = ((Map<String,List>) resourceSpans.get(0)).get("scopeSpans");
//		OpenTelemetryEvents telemetryEvents = null;
//		OpenTelemetryEvents result = null;
//		for(int i = 0; i < scopeSpans.size(); i++) {
//			telemetryEvents = new OpenTelemetryEvents();
//			String scope = (String) ((Map<String,Object>) ((Map<String,Object>) scopeSpans.get(i)).get("scope")).get("name");
//			if(scope.equalsIgnoreCase("telemetry-tracer")) {
//				List spans = ((Map<String,List>) scopeSpans.get(i)).get("spans");
//				for(int k = 0; k < spans.size(); k++) {
//					telemetryEvents.setLastUpdatedDate(LocalDateTime.now());
//					telemetryEvents.setTraceId(((Map<String,String>) spans.get(k)).get("traceId"));
//					telemetryEvents.setSpanId(((Map<String,String>) spans.get(k)).get("spanId"));
//					Long startTime = Long.valueOf(((Map<String,String>) spans.get(k)).get("startTimeUnixNano")).longValue();
//					Long endTime = Long.valueOf(((Map<String,String>) spans.get(k)).get("endTimeUnixNano")).longValue();
//					Long duration = endTime - startTime;
//					telemetryEvents.setStartTime(startTime);
//					telemetryEvents.setEndTime(endTime);
//					telemetryEvents.setDuration(duration);
//					List events = ((Map<String,List>) spans.get(k)).get("events");
//					telemetryEvents.setEvents(events.toString());
//					List attributes = (List) ((Map<String,Object>) spans.get(k)).get("attributes");
//					for(int j = 0; j < attributes.size(); j++) {
//						String key = ((Map<String,String>) attributes.get(j)).get("key");
//						String value = ((Map<String,String>) ((Map<String,Object>) attributes.get(j)).get("value")).get("stringValue");
//						if(key.equalsIgnoreCase("url")) {
//							telemetryEvents.setUrl(value);
//						}
//						if(key.equalsIgnoreCase("portfolioId")) {
//							telemetryEvents.setPortfolioId(Long.valueOf(value));
//						}
//						if(key.equalsIgnoreCase("portfolio")) {
//							telemetryEvents.setPortfolio(value);
//						}
//						if(key.equalsIgnoreCase("projectId")) {
//							telemetryEvents.setProjectId(Long.valueOf(value));
//						}
//						if(key.equalsIgnoreCase("project")) {
//							telemetryEvents.setProject(value);
//						}
//						if(key.equalsIgnoreCase("userId")) {
//							telemetryEvents.setUserId(Long.valueOf(value));
//						}
//						if(key.equalsIgnoreCase("user")) {
//							telemetryEvents.setUsername(value);
//						}
//						if(key.equalsIgnoreCase("role")) {
//							telemetryEvents.setRole(value);
//						}
//						if(key.equalsIgnoreCase("version")) {
//							telemetryEvents.setVersion(value);
//						}
//						if(key.equalsIgnoreCase("module")) {
//							telemetryEvents.setModule(value);
//						}
//						if(key.equalsIgnoreCase("component")) {
//							telemetryEvents.setComponent(value);
//						}
//						if(key.equalsIgnoreCase("context")) {
//							telemetryEvents.setContext(value);
//						}
//					}
//				}
//				result = saveTrace(telemetryEvents);
//			}
//		}
//		return result;
//	}
//
//}
