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
package com.infosys.icets.icip.icipwebeditor.service.impl;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.quartz.SchedulerException;

import com.infosys.icets.icip.icipwebeditor.constants.SetupResources;
import com.infosys.icets.icip.icipwebeditor.model.ICIPGroupModel;

public class ICIPGroupsModelServiceTest {

	private static ICIPGroupModelService groupModelService;

	@BeforeAll
	private static void setup() throws SchedulerException {
		SetupResources.setup();
		groupModelService = new ICIPGroupModelService(SetupResources.groupModelRepository,SetupResources.groupModelRepository2);
	}

	@Test
	void renameProjectTest() {
		Mockito.when(SetupResources.groupModelRepository.save(Mockito.mock(ICIPGroupModel.class)))
				.thenReturn(SetupResources.groupModel2);
		assertTrue(groupModelService.renameProject(SetupResources.ORG, SetupResources.GROUP));
	}

//	@Test
//	void copyTest() {
//		assertTrue(groupModelService.copy(null, SetupResources.ORG, SetupResources.GROUP));
//	}

//	@Test
//	void saveTest() {
//		Optional<ICIPGroupModel> iCIPGroupsFetched;// = iCIPGroupsRepository.findOne(example);
//		Mockito.when(SetupResources.groupModelRepository.findOne(Example.of(Mockito.mock(ICIPGroupModel.class)))
//				.thenReturn(Optional.of(SetupResources.groupModel1));
//		SetupResources.groupModel2.setGroups(SetupResources.group2);
//		assertEquals(groupModelService.save(SetupResources.ENTITY_TYPE, SetupResources.GROUP2, SetupResources.group2),
//				SetupResources.groupModel2);
//	}

}
