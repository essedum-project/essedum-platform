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

package com.lfn.iamp.usm.web.rest;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.time.ZonedDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.Optional;

import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.mockito.Mockito;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.UsmPortfolio;
import com.lfn.iamp.usm.dto.ProjectDTO;
import com.lfn.iamp.usm.repository.ProjectRepository;
import com.lfn.iamp.usm.repository.UserProjectRoleRepository;
import com.lfn.iamp.usm.repository.UsmPortfolioRepository;
import com.lfn.iamp.usm.service.UsmPortfolioService;
import com.lfn.iamp.usm.service.impl.ProjectServiceImpl;

// TODO: Auto-generated Javadoc
/**
 * The Class ProjectResourceTest.
 *
 * @author essedum
 */
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)

public class ProjectResourceTest {
	
	/** The project resource. */
	static ProjectResource projectResource;
	
	/** The pageable. */
	static Pageable pageable = null;
	
	/** The req. */
	static PageRequestByExample<Project> req = null;
	
	/** The project. */
	static Project project = new Project();
	/** */
	ObjectMapper Obj = new ObjectMapper();


	/**
	 * Setup.
	 */
	@BeforeAll
	static void setup() {
		ProjectRepository projectrepository = Mockito.mock(ProjectRepository.class);
//		ProjectRepo projectRepo = Mockito.mock(ProjectRepo.class);
		UsmPortfolioRepository usmPortfolioRepository = Mockito.mock(UsmPortfolioRepository.class);
		UsmPortfolioService usmPortfolioService = Mockito.mock(UsmPortfolioService.class);
		UserProjectRoleRepository userProjectRoleRepository = Mockito.mock(UserProjectRoleRepository.class);
		//UserProjectRoleRepo userProjectRoleRepo = Mockito.mock(UserProjectRoleRepo.class);
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
		Mockito.when(projectrepository.findById(1)).thenReturn(Optional.of(project));
		Mockito.when(projectrepository.save(project)).thenReturn(project);
		Mockito.when(usmPortfolioRepository.findById(2)).thenReturn(Optional.of(usmPortfolio));
		Mockito.when(usmPortfolioRepository.save(usmPortfolio)).thenReturn(usmPortfolio);
		Page<Project> projectPage = new PageImpl<>(Collections.singletonList(project));
		pageable = PageRequest.of(0, 1);
		req = new PageRequestByExample<Project>();
		Mockito.when(projectrepository.findAll(req.toPageable())).thenReturn(projectPage);
		Mockito.when(projectrepository.findAll(pageable)).thenReturn(projectPage);
		Mockito.when(usmPortfolioService.toDTO(usmPortfolio,0)).thenReturn(usmPortfolio);
		 ProjectServiceImpl projectService = new ProjectServiceImpl(projectrepository,usmPortfolioService,userProjectRoleRepository);
		
		 projectResource = new ProjectResource(projectService);
	}

	/**
	 * Test negative create project.
	 */
	@Test
	@Order(1)
	public void testNegativeCreateProject() {
		ProjectDTO projectDTO = new ProjectDTO();
		ModelMapper modelMapper = new ModelMapper();
		projectDTO = modelMapper.map(project, ProjectDTO.class);
		try {
			assertEquals(projectResource.createProject(projectDTO).getStatusCode(),
					HttpStatus.BAD_REQUEST);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create project.
	 */
	@Test
	@Order(1)
	public void testErrorCreateProject() {
		Project project = new Project();
		project.setName("Test");
		project.setDefaultrole(true);
		project.setDescription("Test Project");
		UsmPortfolio usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(2);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test");
		usmPortfolio.setLastUpdated(ZonedDateTime.now());
		project.setPortfolioId(usmPortfolio);
		ProjectDTO projectDTO = new ProjectDTO();
		ModelMapper modelMapper = new ModelMapper();
		projectDTO = modelMapper.map(project, ProjectDTO.class);
		try {
			Mockito.when(projectResource.createProject(projectDTO))
			.thenThrow(new DataIntegrityViolationException(null));
			assertEquals(projectResource.createProject(projectDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	/**
	 * Test negative create project.
	 */
	@Test
	@Order(1)
	public void testErrorcreateProject() {
		Project project = new Project();
		project.setDefaultrole(true);
		project.setDescription("Test Project");
		UsmPortfolio usmPortfolio = new UsmPortfolio();
		usmPortfolio.setId(2);
		usmPortfolio.setPortfolioName("test");
		usmPortfolio.setDescription("test");
		usmPortfolio.setLastUpdated(ZonedDateTime.now());
		project.setPortfolioId(usmPortfolio);
		ProjectDTO projectDTO = new ProjectDTO();
		ModelMapper modelMapper = new ModelMapper();
		projectDTO = modelMapper.map(project, ProjectDTO.class);
		try {
			assertEquals(projectResource.createProject(projectDTO).getStatusCode(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}


	/**
	 * Test update project.
	 */
	@Test
	@Order(1)
	public void testUpdateProject() {
		ProjectDTO projectDTO = new ProjectDTO();
		ModelMapper modelMapper = new ModelMapper();
		projectDTO = modelMapper.map(project, ProjectDTO.class);
		try {
			assertEquals(projectResource.updateProject(projectDTO).getStatusCode(), HttpStatus.OK);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test get all projects.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testGetAllProjects() throws JsonMappingException, UnsupportedEncodingException, JsonProcessingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes()); 
		assertEquals(projectResource.getAllProjects(str).getStatusCode(), HttpStatus.OK);
	}


	/**
	 * Test get all project.
	 */
	@Test
	@Order(1)
	public void testGetAllProject() {
		assertEquals(projectResource.getAllProjects(pageable).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test get project.
	 */
	@Test
	@Order(1)
	public void testGetProject() {
		assertEquals(projectResource.getProject(1).getStatusCode(), HttpStatus.OK);
	}

	/**
	 * Test delete project.
	 * @throws SQLException 
	 */
	@Test
	@Order(1)
	public void testDeleteProject() throws SQLException {
		assertEquals(projectResource.deleteProject(project.getId()).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test negative get project.
	 */
	@Test
	@Order(2)
	public void testNegativeGetProject() {
		Mockito.when(projectResource.getProject(1)).thenThrow(new EntityNotFoundException());
		assertEquals(projectResource.getProject(1).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative update project exception.
	 */
	@Test
	@Order(2)
	public void testNegativeUpdateProjectException() {
		ProjectDTO projectDTO = new ProjectDTO();
		ModelMapper modelMapper = new ModelMapper();
		projectDTO = modelMapper.map(project, ProjectDTO.class);
		try {
			Mockito.when(projectResource.updateProject(projectDTO)).thenThrow(new EntityNotFoundException());
			assertEquals(projectResource.updateProject(projectDTO).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}
	}
	
	/**
	 * Test negative get all projects.
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllProjects() {
		Mockito.when(projectResource.getAllProjects(pageable)).thenThrow(new EntityNotFoundException());
		assertEquals(projectResource.getAllProjects(pageable).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative delete project.
	 * @throws SQLException 
	 */
	@Test
	@Order(2)
	public void testNegativeDeleteProject() throws SQLException {
		Mockito.when(projectResource.deleteProject(2)).thenThrow(new EntityNotFoundException());
		assertEquals(projectResource.deleteProject(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all projectss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(2)
	public void testNegativeGetAllProjectss() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes()); 
		Mockito.when(projectResource.getAllProjects(str)).thenThrow(new EntityNotFoundException());
		assertEquals(projectResource.getAllProjects(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	/**
	 * Test negative delete project.
	 * @throws SQLException 
	 */

	@Test
	@Order(3)
	public void testNegativeDeleteProjects() throws SQLException {
		Mockito.when(projectResource.deleteProject(2)).thenThrow(new EmptyResultDataAccessException(1));
		assertEquals(projectResource.deleteProject(2).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test negative get all projectss.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 */
	@Test
	@Order(3)
	public void testNegativeGetallProjects() throws JsonProcessingException, UnsupportedEncodingException {
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		Mockito.when(projectResource.getAllProjects(str)).thenThrow(new ArithmeticException());
		assertEquals(projectResource.getAllProjects(str).getStatusCode(), HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	/**
	 * Test get all Projects.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testFetchAllProjects() throws JsonProcessingException, UnsupportedEncodingException {
		pageable = PageRequest.of(0, 1);
		PageRequestByExample req = new PageRequestByExample<Project>();
		String str = Base64.getEncoder().encodeToString(Obj.writeValueAsString(req).getBytes());
		assertEquals(projectResource.getPaginatedProjectList(str,pageable).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test Search Project.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws URISyntaxException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testSearchProject() throws JsonProcessingException, UnsupportedEncodingException, URISyntaxException {
		pageable = PageRequest.of(0, 1);
//		req = new PageRequestByExample<Users>();
		assertEquals(projectResource.searchProjects(pageable, req).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test SearchProject.
	 * @throws JsonProcessingException 
	 * @throws UnsupportedEncodingException 
	 * @throws URISyntaxException 
	 * @throws JsonMappingException 
	 */
	@Test
	@Order(1)
	public void testSearchProjects() throws JsonProcessingException, UnsupportedEncodingException, URISyntaxException {
		pageable = PageRequest.of(0, 1);
		PageRequestByExample<Project> req = new PageRequestByExample<Project>();
		assertEquals(projectResource.searchProjects(pageable, req).getStatusCode(), HttpStatus.OK);
	}
	
	/**
	 * Test get all ProjectNames.
	  
	 */
	@Test
	@Order(1)
	public void testgetProjectNames()  {	
		assertEquals(projectResource.getProjectNames().getStatusCode(), HttpStatus.OK);
	}
	 

	/**
	 * Test findProjectByName.
	 */
	@Test
	@Order(1)
	public void testfindProjectByName()  {	
		assertEquals(projectResource.getProjectByName("Test").getStatusCode(), HttpStatus.OK);
	}
}
