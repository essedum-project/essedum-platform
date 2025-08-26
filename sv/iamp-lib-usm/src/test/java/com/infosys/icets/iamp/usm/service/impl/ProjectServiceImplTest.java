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

package com.infosys.icets.iamp.usm.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.Project;
import com.infosys.icets.iamp.usm.domain.UserProjectRole;
import com.infosys.icets.iamp.usm.domain.UsmPortfolio;
import com.infosys.icets.iamp.usm.repository.ProjectRepository;
import com.infosys.icets.iamp.usm.repository.UserProjectRoleRepository;
import com.infosys.icets.iamp.usm.repository.UsmPortfolioRepository;
import com.infosys.icets.iamp.usm.service.UsmPortfolioService;

// TODO: Auto-generated Javadoc
/**
 * The Class ProjectServiceImplTest.
 *
 * @author icets
 */
public class ProjectServiceImplTest {
	
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ProjectServiceImplTest.class);

	/** The service. */
	static ProjectServiceImpl service;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The project. */
	static Project project;
	
	/** The req. */
	static PageRequestByExample<Project> req = null;
	static List<UserProjectRole> userProjectRoles =  new ArrayList<>();

	
	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		ProjectRepository projectrepository = Mockito.mock(ProjectRepository.class);
//		ProjectRepo projectRepo = Mockito.mock(ProjectRepo.class);
		UsmPortfolioService usmPortfolioService = Mockito.mock(UsmPortfolioService.class);
		UserProjectRoleRepository userProjectRoleRepository = Mockito.mock(UserProjectRoleRepository.class);
		//UserProjectRoleRepo userProjectRoleRepo = Mockito.mock(UserProjectRoleRepo.class);
		UsmPortfolioRepository usmPortfolioRepository = Mockito.mock(UsmPortfolioRepository.class);

		project = new Project();
		project.setId(1);
		project.setName("Test");
		project.setDefaultrole(true);
		project.setDescription("Test Project");
		UsmPortfolio usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(2);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test");
		usmPortfolio.setLastUpdated(ZonedDateTime.now());
		project.setPortfolioId(usmPortfolio);
		Mockito.when(usmPortfolioRepository.findById(2)).thenReturn(Optional.of(usmPortfolio));
		Mockito.when(usmPortfolioRepository.save(usmPortfolio)).thenReturn(usmPortfolio);
		Mockito.when(usmPortfolioService.toDTO(usmPortfolio,0)).thenReturn(usmPortfolio);
		try {
			Mockito.when(userProjectRoleRepository.findByProjectIdId((1))).thenReturn(userProjectRoles);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		Mockito.when(projectrepository.findById(1)).thenReturn(Optional.of(project));
		Mockito.when(projectrepository.save(project)).thenReturn(project);
		Mockito.when(projectrepository.findByName("Test")).thenReturn((project));
		Page<Project> projectPage = new PageImpl<>(Collections.singletonList(project));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<Project>();
		ExampleMatcher matcher = ExampleMatcher.matching() //
                .withMatcher("name", match -> match.ignoreCase().startsWith())
                .withMatcher("description", match -> match.ignoreCase().startsWith());
		Example<Project> example = Example.of(project,matcher);
		req.setExample(project);
		Mockito.when(projectrepository.findAll(example,req.toPageable())).thenReturn(projectPage);
		Mockito.when(projectrepository.findAll(req.toPageable())).thenReturn(projectPage);
		Mockito.when(projectrepository.findAll(pageable)).thenReturn(projectPage);
		service = new ProjectServiceImpl(projectrepository,usmPortfolioService,userProjectRoleRepository);
		
		
	}
	
	/**
	 * Test find by id.
	 */
	@Test
	void testFindById() {
		try {
			assertEquals(service.findOne(1).getId(), 1);
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
	}
	
	/**
	 * Test save.
	 */
	@Test
	void testSave() {
		Project project = new Project();
		project.setId(1);
		project.setName("Test");
		project.setDefaultrole(true);
		project.setDescription("Test Project");
		UsmPortfolio usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(1);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test");
		usmPortfolio.setLastUpdated(ZonedDateTime.now());
		project.setPortfolioId(usmPortfolio);
		try {
			assertEquals(service.save(project).getName(), "Test");
		} catch (SQLException e) {
			log.error("Exception : {}", e.getMessage());
		}
		
	}
	
	/**
	 * Test delete by id.
	 */
	@Test
	void testDeleteById() {

		project.setId(1);

		try {
			service.delete(project);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			assertEquals(service.findOne(1).getId(), 1);
		} catch (SQLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
}
	
	/**
	 * Test find by name.
	 */
	@Test 
	void testFindByName() {
		assertEquals(service.findByName("Test").getName(),"Test");
	}
	
	/**
	 * Test update project.
	 */
	@Test
	void testUpdateProject() {
		assertEquals(service.updateProject(1, ZonedDateTime.now()),0);
	}
	
	/**
	 * Test find all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testFindAll() throws SQLException {
		Page<Project> projectlist = service.findAll(pageable);
		assertEquals(projectlist.getTotalElements(), 1);
	}
	@Test
	void testFindAllProjects() throws SQLException {
		List<Project> projectlist = service.findAll();
		assertEquals(true,projectlist.isEmpty());
	}
	
	/**
	 * Test get all.
	 *
	 * @throws SQLException the SQL exception
	 */
	@Test
	void testGetAll() throws SQLException {
		PageResponse<Project> projectlist = service.getAll(req);
		assertEquals(projectlist.getTotalElements(), 1);
	}
}
