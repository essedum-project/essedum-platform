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

package com.lfn.common.app.web.rest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.sql.SQLException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import com.lfn.common.app.web.rest.ApplicationConfigResource;
import com.lfn.iamp.usm.config.ApplicationProperties;
import com.lfn.iamp.usm.config.ApplicationProperties.UIConfig;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.UsmPortfolio;
import com.lfn.iamp.usm.service.ProjectService;
import com.lfn.iamp.usm.service.impl.ProjectServiceImpl;

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
