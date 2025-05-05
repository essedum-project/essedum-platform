package com.infosys.icets.icip.icipmodelserver.rest;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.icip.icipmodelserver.jobs.ModelInternalJob;
import com.infosys.icets.icip.icipwebeditor.event.service.InternalJobEventService;
//COMMENTED AS PART OF API CLEANUP
// TODO: Auto-generated Javadoc
/**
 * The Class ICIPModelJobsController.
 */
//@RestController
//@RequestMapping(path = "/${icip.pathPrefix}/modeljobs")
//public class ICIPModelJobsController {
//
//	/** The event service. */
//	@Autowired
//	private InternalJobEventService eventService;
//
//	/**
//	 * Run bootstrap model.
//	 *
//	 * @param body the body
//	 */
//	@PostMapping("/all")
//	public void runBootstrapModel(@RequestBody String body) {
//		eventService.runInternalJob(body, "ModelInternalJobs", ModelInternalJob.class, new HashMap<>());
//	}
//
//}
