/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
