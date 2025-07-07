/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.job.service.impl;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.SQLException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.quartz.ListenerManager;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;

import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.icipwebeditor.constants.SetupResources;
import com.infosys.icets.icip.icipwebeditor.job.ICIPNativeServiceJob;
import com.infosys.icets.icip.icipwebeditor.job.listener.ICIPJobSchedulerListener;
import com.infosys.icets.icip.icipwebeditor.job.model.ChainObject.ChainJobElement2.ChainJob2;
import com.infosys.icets.icip.icipwebeditor.service.JobScheduleService;
import com.infosys.icets.icip.icipwebeditor.service.impl.JobScheduleServiceImpl;

public class JobScheduleServiceTest {

	private static Scheduler scheduler = Mockito.mock(Scheduler.class);
	private static JobScheduleService jobSchedulerService;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	@BeforeAll
	private static void setup() throws SchedulerException {
		SetupResources.setup();
		SchedulerFactoryBean schedulerFactory = Mockito.mock(SchedulerFactoryBean.class);
		scheduler = Mockito.mock(Scheduler.class);
		Mockito.when(schedulerFactory.getScheduler()).thenReturn(scheduler);
		jobSchedulerService = new JobScheduleServiceImpl(schedulerFactory, true, null, null, null, null, null, null);
	}

	@Test
	void createChainJobTestInStandBy() throws SchedulerException {
		Mockito.when(scheduler.isInStandbyMode()).thenReturn(true);
		Exception exception = assertThrows(SchedulerException.class, () -> {
			jobSchedulerService.createChainJob(null, SetupResources.c1, null, ICIPNativeServiceJob.class, null, false,
					0, ICIPUtils.getUser(claim),null);
		});
		String expectedMessage = SetupResources.UNABLE_TO_PROCEED_IN_STANDBY_MODE;
		String actualMessage = exception.getMessage();
		assertTrue(actualMessage.contains(expectedMessage));
	}

	@Test
	void createChainJobTestInStandBy2() throws SchedulerException, SQLException {
		Mockito.when(scheduler.isInStandbyMode()).thenReturn(true);
		ListenerManager listenerManager = Mockito.mock(ListenerManager.class);
		ICIPJobSchedulerListener jobListener = Mockito.mock(ICIPJobSchedulerListener.class);
		Mockito.when(listenerManager.getJobListener(Mockito.anyString())).thenReturn(jobListener);
		Mockito.when(scheduler.getListenerManager()).thenReturn(listenerManager);
		ChainJob2[] chainJob2Object = { Mockito.mock(ChainJob2.class) };
		jobSchedulerService.createChainJob(chainJob2Object, SetupResources.c2, null, ICIPNativeServiceJob.class, null,
				false, 0, ICIPUtils.getUser(claim),null);
	}

	@Test
	void createChainJobTestInRunning() throws SchedulerException, SQLException {
		Mockito.when(scheduler.isInStandbyMode()).thenReturn(false);
		ListenerManager listenerManager = Mockito.mock(ListenerManager.class);
		ICIPJobSchedulerListener jobListener = Mockito.mock(ICIPJobSchedulerListener.class);
		Mockito.when(listenerManager.getJobListener(Mockito.anyString())).thenReturn(jobListener);
		Mockito.when(scheduler.getListenerManager()).thenReturn(listenerManager);
		ChainJob2[] chainJob2Object = { Mockito.mock(ChainJob2.class) };
		jobSchedulerService.createChainJob(chainJob2Object, SetupResources.c1, null, ICIPNativeServiceJob.class, null,
				false, 0, ICIPUtils.getUser(claim),null);
	}

}
