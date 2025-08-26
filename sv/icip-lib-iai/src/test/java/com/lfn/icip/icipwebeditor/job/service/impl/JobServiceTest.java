package com.lfn.icip.icipwebeditor.job.service.impl;

import org.junit.jupiter.api.Test;

import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPJobsService;

//@RunWith(SpringJUnit4ClassRunner.class)
public class JobServiceTest {

	private ICIPJobsService service;

	public JobServiceTest(ICIPJobsService service) {
		this.service = service;
	}

	@Test
	void test() {
		service.getAllCommonJobs("leo1311", 0, 10, "", "", "1970-12-12", "Asia/Kolkata", "submittedon", "DESC");
	}

}
