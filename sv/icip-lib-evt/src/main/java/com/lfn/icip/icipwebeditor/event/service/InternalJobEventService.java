package com.lfn.icip.icipwebeditor.event.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.icipwebeditor.event.model.InternalEvent;
import com.lfn.icip.icipwebeditor.event.publisher.InternalEventPublisher;

// TODO: Auto-generated Javadoc
/**
 * The Class InternalJobEventService.
 */
@Service
public class InternalJobEventService {

	/** The Constant SUBMITTED_BY. */
	private static final String SUBMITTED_BY = "submittedBy";
	
	/** The Constant ORG. */
	private static final String ORG = "org";
	
	/** The Constant ZONEID. */
	private static final String ZONEID = "zoneid";
	
	/** The Constant DATE. */
	private static final String DATE = "date";
	
	/** The Constant TIME. */
	private static final String TIME = "time";
	
	/** The Constant EXPRESSION. */
	private static final String EXPRESSION = "expression";
	
	/** The Constant RUNNOW. */
	private static final String RUNNOW = "runnow";
	
	/** The Constant EVENT. */
	private static final String EVENT = "event";

	/** The event service. */
	@Autowired
	private InternalEventPublisher eventService;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	/**
	 * Run internal job.
	 *
	 * @param body the body
	 * @param name the name
	 * @param clazz the clazz
	 * @param extraParameters the extra parameters
	 */
	public void runInternalJob(String body, String name, Class clazz, Map<String, String> extraParameters) {
		Gson gson = new Gson();
		JsonObject bodyElement = gson.fromJson(body, JsonObject.class);
		String org = bodyElement.get(ORG).getAsString();
		String userDate = bodyElement.get(DATE).getAsString();
		String userTime = bodyElement.get(TIME).getAsString();
		String zoneid = bodyElement.get(ZONEID).getAsString();
		Boolean isEvent = bodyElement.has(EVENT) ? bodyElement.get(EVENT).getAsBoolean() : false;
		Boolean runnow = bodyElement.has(RUNNOW) ? bodyElement.get(RUNNOW).getAsBoolean() : false;
		LocalDateTime date = createLocalDateTime(userDate, userTime);
		ZonedDateTime dateTime = ZonedDateTime.of(date, ZoneId.of(zoneid));
		String expression = bodyElement.get(EXPRESSION).getAsString();
		boolean isCron = expression != null && !expression.trim().isEmpty();
		int jobTimeout=bodyElement.has("jobTimeout")?bodyElement.get("jobTimeout").getAsInt():0;
		Map<String, String> params = new HashMap<>();
		params.put(SUBMITTED_BY, ICIPUtils.getUser(claim));
		params.put(ORG, org);
		params.put(ZONEID, zoneid);
		params.put(RUNNOW, Boolean.toString(runnow));
		params.put(EVENT, Boolean.toString(isEvent));
		if(params.containsKey("intervalInHours")) {
			params.put("intervalInHours", bodyElement.get("intervalInHours").getAsString());
		}
		params.putAll(extraParameters);
		InternalEvent event = new InternalEvent(this, name, org, params, clazz, isCron, expression, dateTime, runnow,jobTimeout);
		eventService.getApplicationEventPublisher().publishEvent(event);
	}

	/**
	 * Creates the local date time.
	 *
	 * @param date the date
	 * @param time the time
	 * @return the local date time
	 */
	private LocalDateTime createLocalDateTime(String date, String time) {
		if (!date.trim().isEmpty() && !time.trim().isEmpty()) {
			String[] tmpDates = date.split("-");
			int yyyy = Integer.parseInt(tmpDates[0]);
			int mm = Integer.parseInt(tmpDates[1]);
			int dd = Integer.parseInt(tmpDates[2]);
			String[] tmpTime = time.split(":");
			int hr = Integer.parseInt(tmpTime[0]);
			int min = Integer.parseInt(tmpTime[1]);
			return LocalDateTime.of(yyyy, mm, dd, hr, min);
		}
		return LocalDateTime.now();
	}

}
