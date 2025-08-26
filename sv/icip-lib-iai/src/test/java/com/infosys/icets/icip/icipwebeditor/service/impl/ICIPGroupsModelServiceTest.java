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
