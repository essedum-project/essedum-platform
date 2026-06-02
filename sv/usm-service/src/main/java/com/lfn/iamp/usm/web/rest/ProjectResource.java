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

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.SQLException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.Crypt;
import com.lfn.ai.comm.lib.util.FileValidate;
import com.lfn.ai.comm.lib.util.FileValidateV2;
import com.lfn.ai.comm.lib.util.HeaderUtil;
import com.lfn.ai.comm.lib.util.HeadersUtil;
import com.lfn.ai.comm.lib.util.PaginationUtil;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.dto.FileValidateSummary;
import com.lfn.ai.comm.lib.util.exceptions.ExtensionKeyInvalidValue;
import com.lfn.ai.comm.lib.util.exceptions.ExtensionKeyNotFoundException;
import com.lfn.ai.comm.lib.util.exceptions.InvalidProjectRequestHeader;
import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.config.Constants;
import com.lfn.iamp.usm.config.Messages;
import com.lfn.iamp.usm.domain.Project;
import com.lfn.iamp.usm.domain.UsmPortfolio;
import com.lfn.iamp.usm.dto.ProjectDTO;
import com.lfn.iamp.usm.repository.DashConstantRepository;
import com.lfn.iamp.usm.service.CamundaUSM;
import com.lfn.iamp.usm.service.ProjectService;
import com.lfn.iamp.usm.service.UsmPortfolioService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

// TODO: Auto-generated Javadoc
/**
 * REST controller for managing Project.
 */
/**
* @author essedum
*/
@RestController
@RequestMapping("/api")
@Tag(name= "User Management", description = "User Management")
public class ProjectResource {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(ProjectResource.class);

	/** The Constant ENTITY_NAME. */
	private static final String ENTITY_NAME = "project";

	/** The project service. */
	private final ProjectService projectService;
	/** The enckeydefault. */
	@EssedumProperty("application.uiconfig.enckeydefault")
	private static String enckeydefault;
	
    @Autowired
    DashConstantRepository dashConstantRepository;
	
    @Autowired
    FileValidate filevalidate;
    @Autowired
    FileValidateV2 fileValidateV2;
        
    @Autowired
    private HttpServletRequest request;
	
	@Autowired(required = false)
	private CamundaUSM camundaUSM;
	
	@Autowired
	private UsmPortfolioService usmPortfolioService;
	
	private String autoUserProject="application.uiconfig.autoUserProject";
	 
	/**
	 * Instantiates a new project resource.
	 *2
	 * @param projectService the project service
	 */
	public ProjectResource(ProjectService projectService) {
		this.projectService = projectService;
	}

	/**
	 * POST /projects/page : get all the projects.
	 *
	 * @param value the value
	 * @return the ResponseEntity with status 200 (OK) and the list of projects in
	 *         body as PageResponse
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/projects/page")
	@Timed
	public ResponseEntity<?> getAllProjects(@RequestHeader("example") String value) throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException {
		try {
			log.info("getAllProjects : Request to get list of projects");			
//			if(prbe.getLazyLoadEvent() ==  null) {
//				return new ResponseEntity<String>("Please provide lazy load event", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
//			}
			ObjectMapper objectMapper = new ObjectMapper();
			objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			String body = new String(Base64.getDecoder().decode(value), "UTF-8");
			PageRequestByExample<Project> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<Project>>() {
			});			
			log.info("getAllProjects : Fetched  list of projects successftully");
			return new ResponseEntity<>(projectService.getAll(prbe), new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (ArithmeticException e) {
			// TODO: handle exception
			log.error(new StringBuffer("ArithmeticException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_LAZY_LOAD_EVENT), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * POST /projects : Create a new project.
	 *
	 * @param project_dto the project dto
	 * @return the ResponseEntity with status 201 (Created) and with body the new
	 *         project, or with status 400 (Bad Request) if the project has already
	 *         an ID
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PostMapping("/projects")
	@Timed
	public ResponseEntity<?> createProject(@RequestBody ProjectDTO project_dto) throws URISyntaxException {
		String allowedExtensionKey = "FileUpload.AllowedExtension.USM.AddImage";
		
		int projectId;
		try {
//		    projectId = HeadersUtil.getProjectHeader(request);

			log.info("createProject : Request to create Project with Name: {}", project_dto.getName());
			log.debug("REST request to save Project : {}", project_dto);
			   if(project_dto.getLogo()!=null && project_dto.getLogoName() !=null) {
               InputStream streamData = new ByteArrayInputStream(project_dto.getLogo());
               if(null != project_dto.getId()) {
               FileValidateSummary parsedOutput= fileValidateV2.validateWithKey(streamData, allowedExtensionKey,project_dto.getId(), project_dto.getLogoName(),true);
                if(parsedOutput !=null && !parsedOutput.isValid ) {
                   return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid upload file"+ parsedOutput.reason);
               }
               }
               }
			if (project_dto.getId() != null) {
				return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert(ENTITY_NAME, "Id exists",
						"A new project cannot already have a Id")).body(null);
			}
			ModelMapper modelMapper = new ModelMapper();
			Project project = modelMapper.map(project_dto, Project.class);
			Project result = projectService.save(project);
			if(project_dto.getAutoUserProject() &&  result.getId()!= null ) {
			int recUpdated = dashConstantRepository.updateAutoUserProject( result.getId(), autoUserProject);
			}
			if (result == null) {
				return new ResponseEntity<String>("Project could not be created", new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
				log.info("createProject : created Project  successfully with ID: {} Name: {}", result.getId(),result.getName());
			if(camundaUSM!=null) {
	        	camundaUSM.createGroup(project_dto);
	        }
			return ResponseEntity.created(new URI(new StringBuffer("/api/projects/").append(result.getId()).toString()))
					.headers(HeaderUtil.createEntityCreationAlert(ENTITY_NAME, result.getId().toString())).body(result);

		} catch (ExtensionKeyNotFoundException e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
		}
	catch(ExtensionKeyInvalidValue e) {
		return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);}            
//	} catch (InvalidProjectRequestHeader e) {
//		return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
//	} 
		catch (SQLException | ConstraintViolationException | DataIntegrityViolationException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Project"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * PUT /projects : Updates an existing project.
	 *
	 * @param project_dto the project dto
	 * @return the ResponseEntity with status 200 (OK) and with body the updated
	 *         project, or with status 400 (Bad Request) if the project is not
	 *         valid, or with status 500 (Internal Server Error) if the project
	 *         couldn't be updated
	 * @throws URISyntaxException if the Location URI syntax is incorrect
	 */
	@PutMapping("/projects")
	@Timed
	public ResponseEntity<?> updateProject(@RequestBody ProjectDTO project_dto) throws URISyntaxException {
		String allowedExtensionKey = "FileUpload.AllowedExtension.USM.AddImage";
		int projectId;
		try {
		    projectId = HeadersUtil.getProjectHeader(request);
			log.info("updateProject : Request to Update Project for ID: {} Name: {}",project_dto.getId(),project_dto.getName());
			log.debug("REST request to update Project : {}", project_dto);
	          if(project_dto.getLogo()!=null && project_dto.getLogoName() !=null) {
	        	  
	            InputStream streamData = new ByteArrayInputStream(project_dto.getLogo());
	            FileValidateSummary parsedOutput= fileValidateV2.validateWithKey(streamData, allowedExtensionKey, projectId, project_dto.getLogoName(),true);
	          	if(parsedOutput !=null && !parsedOutput.isValid ) {
	                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid upload file"+ parsedOutput.reason);
	            }
	            }
			if (project_dto.getId() == null) {
				return createProject(project_dto);
			}
			ModelMapper modelMapper = new ModelMapper();
			Project project = modelMapper.map(project_dto, Project.class);
			
			if(camundaUSM!=null) {
	        	camundaUSM.updateGroup(project_dto);
	        }
			
			Project result = projectService.save(project);
			log.info("updateProject : Updated Project Successfully for ID:{} Name: {}",result.getId(),result.getName());
			if(project_dto.getAutoUserProject() &&  result.getId()!= null ) {
				int recUpdated = dashConstantRepository.updateAutoUserProject( result.getId(), autoUserProject);
				}
			return ResponseEntity.ok()
					.headers(HeaderUtil.createEntityUpdateAlert(ENTITY_NAME, project.getId().toString())).body(result);
		}
		catch (ExtensionKeyNotFoundException e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
		}
	catch(ExtensionKeyInvalidValue e) {
		return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);            
	} catch (InvalidProjectRequestHeader e) {
		return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
	} 
		catch (IllegalArgumentException e) {
			// TODO: handle exception
			log.error(new StringBuffer("IllegalArgumentException").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>("Could not update project in mlstudio", new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
		catch (SQLException | ConstraintViolationException | DataIntegrityViolationException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(Messages.getMsg(Constants.MSG_USM_CONSTRAINT_VIOLATED, "Project"), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /projects : get all the projects.
	 *
	 * @param pageable the pagination information
	 * @return the ResponseEntity with status 200 (OK) and the list of projects in
	 *         body
	 */
	@GetMapping("/projects")
	@Timed
	public ResponseEntity<?> getAllProjects(Pageable pageable) {
		try {
			log.info("getAllProjects : Request to get list of Projects");
			Page<Project> page = projectService.findAll(pageable);
			log.info("getAllProjects : Fetched list of Projects successfully");
			return new ResponseEntity<>(page.getContent(), PaginationUtil.generatePaginationHttpHeaders(page, "/api/projects"), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * GET /projects/:id : get the "id" project.
	 *
	 * @param id the id of the project to retrieve
	 * @return the ResponseEntity with status 200 (OK) and with body the project, or
	 *         with status 404 (Not Found)
	 */
	@GetMapping("/projects/{id}")
	@Timed
	public ResponseEntity<?> getProject(@PathVariable("id") Integer id) {
		try {
			log.info("getProject : Request to get Project ID:{} ",id); 
			Project project = projectService.findOne(id);
			if (project == null) {
				return new ResponseEntity<String>(new StringBuffer("Project entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			} else
			log.info("getProject : Fetched Project successfully ID: {} Name: {}",project.getId(), project.getName()); 
			return new ResponseEntity<>(project, new HttpHeaders(), HttpStatus.OK);

		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

	/**
	 * DELETE /projects/:id : delete the "id" project.
	 *
	 * @param id the id of the project to delete
	 * @return the ResponseEntity with status 200 (OK)
	 * @throws SQLException 
	 */
	@DeleteMapping("/projects/{id}")
	@Timed
	public ResponseEntity<?> deleteProject(@PathVariable("id") Integer id) throws SQLException {
		Project project = projectService.findOne(id);
		log.info("deleteProject : Request to delete Project by ID: {}",project.getId());
		try {
			if(camundaUSM!=null) {
				camundaUSM.deleteGroup(project.getId());
			}
			projectService.delete(project);
		} catch (EmptyResultDataAccessException e) {
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(new StringBuffer("Project entity with id ").append(id).append(" does not exists!").toString(), new HttpHeaders(),
					HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (SQLException | EntityNotFoundException e) {
			// TODO: handle exception
			log.error(new StringBuffer("SQLException ").append(e.getClass().getName()).append(": ").append(e).toString());
			return new ResponseEntity<String>(e.getMessage(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
		log.info("deleteProject : deleted Project successfully by ID: {}",id);
		return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert(ENTITY_NAME, id.toString())).build();
	}
	
	/**
	 * Gets the paginated project list.
	 *
	 * @param value the value
	 * @param pageable the pageable
	 * @return the paginated project list
	 * @throws UnsupportedEncodingException the unsupported encoding exception
	 * @throws JsonMappingException the json mapping exception
	 * @throws JsonProcessingException the json processing exception
	 */
	@GetMapping("/projectss/page")
	@Timed
	public ResponseEntity<PageResponse<Project>> getPaginatedProjectList(@RequestHeader("example") String value, @Parameter Pageable pageable)  throws UnsupportedEncodingException, JsonMappingException, JsonProcessingException{
		log.info("Request to get a page of Projects  {} ", pageable);
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		String body = new String(Base64.getDecoder().decode(value), "UTF-8");
		PageRequestByExample<Project> prbe = objectMapper.readValue(body, new TypeReference<PageRequestByExample<Project>>() {
		});
		log.info("Request to get a page of Projects {}: end", pageable);
		return new ResponseEntity<>(projectService.getPaginatedProjectList(prbe,pageable), new HttpHeaders(), HttpStatus.OK);
	}
	
	/**
	 * Search projects.
	 *
	 * @param pageable the pageable
	 * @param prbe the prbe
	 * @return the response entity
	 * @throws URISyntaxException the URI syntax exception
	 */
	@PostMapping("/search/projects/page")
	@Timed
	public ResponseEntity<?> searchProjects(@Parameter Pageable pageable,@RequestBody PageRequestByExample<Project> prbe) throws  URISyntaxException  {

			log.info("searchProjects : Request to get list of projects");
			
			log.info("searchProjects : Fetched  list of projects successftully");
			return new ResponseEntity<>(projectService.search(pageable,prbe), new HttpHeaders(), HttpStatus.OK);
		
		}
	
	/**
	 * Gets the project names.
	 *
	 * @return the project names
	 */
	@GetMapping("/projects/names")
	public ResponseEntity<List<String>> getProjectNames() {
		return new ResponseEntity<>(projectService.findAllNames(), new HttpHeaders(), HttpStatus.OK);
	}
	
	/**
	 * Gets the project by name.
	 *
	 * @param name the name
	 * @return the project by name
	 */
	@GetMapping("/projects/get/{name}")
	public ResponseEntity<Project> getProjectByName(@PathVariable String name) {
		return new ResponseEntity<>(projectService.findProjectByName(name), new HttpHeaders(), HttpStatus.OK);
	}
	@GetMapping("/get-encrypted-data")
	@Timed
	public ResponseEntity<String> getEncryptedData(@RequestHeader("example") String value) throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, InvalidAlgorithmParameterException, UnsupportedEncodingException{
		log.info("Request to get encrypted data  {} ", value);
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		String body = Crypt.encrypt(value,enckeydefault);
		log.info("Request to get encrypted data: end");
		return new ResponseEntity<>(body, new HttpHeaders(), HttpStatus.OK);
	}
	@GetMapping("/get-decrypted-data")
	@Timed
	public ResponseEntity<String> getDecryptedData(@RequestHeader("example") String value) throws InvalidKeyException, NoSuchPaddingException, IllegalBlockSizeException, BadPaddingException, InvalidKeySpecException, NoSuchAlgorithmException, UnsupportedEncodingException, InvalidAlgorithmParameterException{
		log.info("Request to get decrypted data  {} ", value);
		ObjectMapper objectMapper = new ObjectMapper();
		objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		String decrypted = Crypt.decrypt(value,enckeydefault);
		log.info("Request to get decrypted data: end");
		return new ResponseEntity<>(decrypted, new HttpHeaders(), HttpStatus.OK);
	}
	
	@GetMapping("/getAllProjects/{projectName}")
	public List<Project> getAllProjectsByName(@PathVariable String projectName){
		
		if(projectName == null) {
			return null;
		}
		List<Project> project = projectService.findAllProjectByName(projectName);
		if(project!=null && project.size()>0)
			return project;
		return null;
	}
	
	@GetMapping("/getProject/{projectName}")
	public Project getProjectByProjectName(@PathVariable String projectName){
		
		if(projectName == null) {
			return null;
		}
		return projectService.findProjectByName(projectName);
	}
	
	@GetMapping("/getPortfolioProjects/{portfolioId}")
	@Timed
	public ResponseEntity<?> getProjectsForPortfolio(@PathVariable Integer portfolioId) {
		log.info("getProject : Request to get Project ID:{} ", portfolioId);
		List<Integer> projectIdList = projectService.findProjectIdsForPortfolio(portfolioId);
		if (projectIdList == null) {
			return new ResponseEntity<String>(new StringBuffer("Portfolio entity with id ").append(portfolioId)
					.append(" does not exists!").toString(), new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR);
		} else
			log.info("getProjectIds : Fetched Project ids successfully");
		return new ResponseEntity<>(projectIdList, new HttpHeaders(), HttpStatus.OK);

	}
	
	@GetMapping("/fetchIds/{name}/{portfolioName}")
    public ResponseEntity<?> fetchDetails(@PathVariable("name") String name, @PathVariable("portfolioName") String portfolioName) {
        if (name == null || portfolioName == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Input!");
        }
        Project project = projectService.findProjectByName(name);
        Integer projectId = project.getId();
        UsmPortfolio portfolio = usmPortfolioService.findUsmPortfolioByName(portfolioName);
        Integer portfolioId  = portfolio.getId();
        if (projectId != null || portfolioId != null) {
 
        	return new ResponseEntity<>((Map.of("name", projectId, "portfolioName", portfolioId)), HttpStatus.OK);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Project or Portfolio not found");
        }
    }
}