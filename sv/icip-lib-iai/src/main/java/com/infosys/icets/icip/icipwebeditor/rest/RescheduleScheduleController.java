package com.infosys.icets.icip.icipwebeditor.rest;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.icip.icipwebeditor.event.service.InternalJobEventService;
import com.infosys.icets.icip.icipwebeditor.job.RescheduleExistingSchedulesJob;

// TODO: Auto-generated Javadoc
/**
 * The Class RescheduleScheduleController.
 */
@RestController
@RequestMapping(path = "/${icip.pathPrefix}/reschedule")
public class RescheduleScheduleController {

	/** The event service. */
	@Autowired
	private InternalJobEventService eventService;

	/**
	 * Run bootstrap model.
	 *
	 * @param body the body
	 */
	@PostMapping("/schedule")
	public void runBootstrapModel(@RequestBody String body) {
		eventService.runInternalJob(body, "Reschedule_Existing_Schedules", RescheduleExistingSchedulesJob.class,
				new HashMap<>());
	}

}
