package com.lfn.ai.comm.lib.util.service;

import java.util.Map;

import org.json.JSONObject;

import com.lfn.ai.comm.lib.util.telemetry.domain.OpenTelemetryEvents;
import com.lfn.ai.comm.lib.util.telemetry.domain.TelemetryEvents;


public interface TelemetryEventsService {
	
	TelemetryEvents saveEvent(TelemetryEvents event);
	
	TelemetryEvents mapToEvent(Map<String, Object> eventMap);
	
	OpenTelemetryEvents saveTrace(OpenTelemetryEvents trace);
	
	OpenTelemetryEvents mapTrace(Object payload);
}
