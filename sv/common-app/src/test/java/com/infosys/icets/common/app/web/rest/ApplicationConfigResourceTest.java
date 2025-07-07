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
package com.infosys.icets.common.app.web.rest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.sql.SQLException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import com.infosys.icets.common.app.web.rest.ApplicationConfigResource;
import com.infosys.icets.iamp.usm.config.ApplicationProperties;
import com.infosys.icets.iamp.usm.config.ApplicationProperties.UIConfig;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UsmPortfolio;
import com.infosys.icets.iamp.usm.service.ProjectService;
import com.infosys.icets.iamp.usm.service.impl.ProjectServiceImpl;

class ApplicationConfigResourceTest {

	static ApplicationConfigResource resource;
	static ApplicationProperties prop;
	static ProjectService projectService = Mockito.mock(ProjectServiceImpl.class);

	@BeforeAll
	static void setup() throws SQLException {
		resource = new ApplicationConfigResource();
		prop = new ApplicationProperties();
		UIConfig uiconfig = prop.getUiconfig();
		uiconfig.setData_limit("500");
		uiconfig.setClientLogo("false");
		uiconfig.setClientLogo("false");
		uiconfig.setAutoUserProject("500");
		resource.setProjectService(projectService);
		Project project = new Project();
		project.setDefaultrole(true);
		project.setDescription("desc");
		project.setId(1);
		project.setLastUpdated(null);
		project.setLogo(null);
		project.setName("test");
		project.setPortfolioId(new UsmPortfolio());
		Mockito.when(projectService.findOne(Mockito.any())).thenReturn(project);
		ReflectionTestUtils.setField(resource, "autoUserProject", "1");

	}

	@Test
	void testGetConfigDetails() throws Exception {
		assertNotNull(resource.getConfigDetails());
	}
}
