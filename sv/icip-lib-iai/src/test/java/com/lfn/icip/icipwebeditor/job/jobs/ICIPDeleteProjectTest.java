package com.lfn.icip.icipwebeditor.job.jobs;


import static org.mockito.Mockito.mock;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.quartz.JobExecutionContext;
import org.slf4j.Marker;

import com.lfn.icip.dataset.service.impl.ICIPAdpService;
import com.lfn.icip.icipwebeditor.file.service.ICIPFileService;
import com.lfn.icip.icipwebeditor.jobmodel.service.ICIPInternalJobsService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPIaiService;

public class ICIPDeleteProjectTest {
	static JobExecutionContext context = Mockito.mock(JobExecutionContext.class);
	private static ICIPFileService fileService = mock(ICIPFileService.class);
	private static ICIPAdpService iCIPAdpService = mock(ICIPAdpService.class);
	private static ICIPIaiService iCIPIaiService = mock(ICIPIaiService.class);
	private static ICIPInternalJobsService jobsService = mock(ICIPInternalJobsService.class);
	private static String loggingPath = "/home/";
//	private static ProjectService projectService = mock(ProjectService.class);
	private static ICIPDeleteProject iCIPDeleteProject;

	@BeforeAll
	public static void createICIPDeleteProject() throws Exception {
//		Mockito.when(projectService.findByName(Mockito.any())).thenReturn(new Project());
		iCIPDeleteProject = new ICIPDeleteProject();
		iCIPDeleteProject.setICIPAdpService(iCIPAdpService);
		iCIPDeleteProject.setICIPIaiService(iCIPIaiService);
		iCIPDeleteProject.setJobsService(jobsService);
		iCIPDeleteProject.setLoggingPath(loggingPath);
//		iCIPDeleteProject.setProjectService(projectService);
	}

	@Test
	public void testDeleteProject() throws Exception {
		Marker marker = Mockito.mock(Marker.class);
		iCIPDeleteProject.deleteProject(marker, "test");
	}

	@Test
	public void testExecute() throws Exception {
		/*
		 * JobDetail jobDetail = Mockito.mock(JobDetail.class);
		 * Mockito.when(jobDetail.getJobDataMap()).thenReturn( new
		 * JobDataMap(ArrayUtils.toMap(new String[][] {{"fromProject","from"},
		 * {"toProject","to"}, {"submittedBy","test"}, {"org","test"}})));
		 * Mockito.when(context.getJobDetail()).thenReturn(jobDetail); ICIPInternalJobs
		 * internalJob = new ICIPInternalJobs(); internalJob.setJobId("tests");
		 * internalJob.setJobStatus(JOBSTATUS.RUNNING.toString());
		 * internalJob.setSubmittedBy("test"); internalJob.setSubmittedOn(null);
		 * internalJob.setJobName("test"); internalJob.setOrganization("test");
		 * Mockito.when(jobsService.save(Mockito.any())).thenReturn(internalJob);
		 * Mockito.when(fileService.readFileAsStringBuilder(Mockito.any())).thenReturn(
		 * new StringBuilder());
		 * 
		 * iCIPDeleteProject.execute(context);
		 */
	}

}
