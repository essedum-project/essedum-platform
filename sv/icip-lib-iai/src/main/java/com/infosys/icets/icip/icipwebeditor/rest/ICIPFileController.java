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

package com.infosys.icets.icip.icipwebeditor.rest;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.eclipse.jgit.api.Git;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.exceptions.ApiError;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.infosys.icets.icip.icipwebeditor.constants.FileConstants;
import com.infosys.icets.icip.icipwebeditor.constants.IAIJobConstants;
import com.infosys.icets.icip.icipwebeditor.file.service.ICIPFileService;
import com.infosys.icets.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.infosys.icets.icip.icipwebeditor.service.impl.GitHubService;

import io.micrometer.core.annotation.Timed;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPFileController.
 *
 * @author icets
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/file")
public class ICIPFileController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPFileController.class);

	/** The file service. */
	@Autowired
	private ICIPFileService fileService;
	
	@Autowired
	private GitHubService githubservice;
	
	@LeapProperty("icip.script.github.enabled")
	private String remoteScript;

	/**
	 * Upload file.
	 *
	 * @param file the file
	 * @return the response entity
	 * @throws Exception the exception
	 */
	@PostMapping(path = "/upload")
	public ResponseEntity<String> uploadFile(@RequestBody MultipartFile file) throws Exception {
		logger.info("request to upload jar-file");
		return new ResponseEntity<>(fileService.storeFile(file, FileConstants.JAR), HttpStatus.OK);
	}

	/**
	 * Save chunks.
	 *
	 * @param cname     the cname
	 * @param org       the org
	 * @param agentType the agent type
	 * @param metadata  the metadata
	 * @param file      the file
	 * @return the response entity
	 */
	@PostMapping(value = "/saveChunks/{name}/{org}/{agenttype}", consumes = { "multipart/form-data" }, produces = {
			"application/json" })
	public ResponseEntity<String[]> saveChunks(@PathVariable(value = "name") String cname,
			@PathVariable(value = "org") String org, @PathVariable(value = "agenttype") String agentType,
			@RequestParam("chunkMetadata") String metadata, @RequestParam("file") MultipartFile file,
			@RequestHeader("Project") int projectId) {
		logger.info("request to upload agent file");
		try {
			ObjectMapper mapper = new ObjectMapper();
			ICIPChunkMetaData chunkMetaData = mapper.readValue(metadata, ICIPChunkMetaData.class);
			Path[] paths = fileService.saveFile(file, chunkMetaData, cname, org, agentType, projectId);
			String[] pathStrs = new String[2];
			if (paths != null && paths.length == 2) {
				Path newPath = Paths.get(paths[1].getParent().toString(), paths[0].getFileName().toString());
				java.nio.file.Files.copy(paths[0], newPath, StandardCopyOption.REPLACE_EXISTING);
				pathStrs[0] = newPath.toAbsolutePath().toString();
				pathStrs[1] = paths[1].getParent().toAbsolutePath().toString();
			}
			return new ResponseEntity<>(pathStrs, HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Upload pipeline file.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @param file  the file
	 * @return the response entity
	 * @throws Exception the exception
	 */
	@PostMapping(path = "/pipeline/upload/{cname}/{org}")
	public ResponseEntity<String> uploadPipelineFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestBody MultipartFile file) throws Exception {
		logger.info(FileConstants.CHECKING_FILE);
		List<String> acceptanceArray = new ArrayList<>(Arrays.asList("jar", "py", "egg", "zip"));
		String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();
		if (acceptanceArray.indexOf(fileExtension) > -1) {
			logger.info("request to upload binary-file");
			try {
				return new ResponseEntity<>( fileService.storeBinaryFile(cname, org, file), HttpStatus.OK);
			} catch (Exception ex) {
				logger.error(ex.getMessage(), ex);
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>(FileConstants.INVALID_FILE_FORMAT, HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Upload pipeline native script file.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @param file  the file
	 * @return the response entity
	 * @throws Exception the exception
	 */
	@PostMapping(path = "/pipeline/native/upload/{cname}/{org}")
	public ResponseEntity<String> uploadPipelineNativeScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestBody MultipartFile file) throws Exception {
		logger.info(FileConstants.CHECKING_FILE);
		List<String> acceptanceArray = new ArrayList<>(Arrays.asList("js", "py"));
		String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();
		if (acceptanceArray.indexOf(fileExtension) > -1) {
			logger.info("request to upload native script code");
			try {
				return new ResponseEntity<>(fileService.storeNativeScriptFile(cname, org, file), HttpStatus.OK);
			} catch (Exception ex) {
				logger.error(ex.getMessage(), ex);
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>(FileConstants.INVALID_FILE_FORMAT, HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Upload pipeline script file.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @param file  the file
	 * @return the response entity
	 * @throws Exception the exception
	 */
	@PostMapping(path = "/pipeline/script/upload/{cname}/{org}")
	public ResponseEntity<String> uploadPipelineScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestBody MultipartFile file) throws Exception {
		logger.info(FileConstants.CHECKING_FILE);
		List<String> acceptanceArray = new ArrayList<>(Arrays.asList("py"));
		String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();
		if (acceptanceArray.indexOf(fileExtension) > -1) {
			logger.info("request to upload script code");
			try {
			return new ResponseEntity<>( fileService.storeScriptFile(cname, org, file), HttpStatus.OK);
			} catch (Exception ex) {
				logger.error(ex.getMessage(), ex);
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>(FileConstants.INVALID_FILE_FORMAT, HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Upload pipeline drag file.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @param file  the file
	 * @return the response entity
	 * @throws Exception the exception
	 */
	@PostMapping(path = "/pipeline/drag/upload/{cname}/{org}")
	public ResponseEntity<String> uploadPipelineDragFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestBody MultipartFile file) throws Exception {
		logger.info(FileConstants.CHECKING_FILE);
		List<String> acceptanceArray = new ArrayList<>(Arrays.asList("yaml"));
		String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();
		if (acceptanceArray.indexOf(fileExtension) > -1) {
			logger.info("request to upload draganddrop code");
			try {
				return new ResponseEntity<>(fileService.storeDragAndDropFile(cname, org, file), HttpStatus.OK);
			} catch (Exception ex) {
				logger.error(ex.getMessage(), ex);
				return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
			}
		} else {
			return new ResponseEntity<>(FileConstants.INVALID_FILE_FORMAT, HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Download file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the response entity
	 */
	@GetMapping(path = "/download/{cname}/{org}", produces = FileConstants.OCTET_STREAM)
	public ResponseEntity<byte[]> downloadFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "filename", required = true) String filename) {
		logger.info("post request to download binary-file");
		try {
			byte[] bytesArray = fileService.downloadBinaryFile(cname, org, filename, FileConstants.BINARY);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + filename).body(bytesArray);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Download pipeline log file.
	 *
	 * @param id the id
	 * @return the response entity
	 */
	@GetMapping(path = "/download/log/pipeline", produces = FileConstants.OCTET_STREAM)
	public ResponseEntity<byte[]> downloadPipelineLogFile(@RequestParam(name = "id", required = true) String id) {
		logger.info("post request to download pipeline log");
		try {
			byte[] bytesArray = fileService.downloadLogFile(id, IAIJobConstants.PIPELINELOGPATH);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + id + ".log").body(bytesArray);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Download chain log file.
	 *
	 * @param id the id
	 * @return the response entity
	 */
	@GetMapping(path = "/download/log/chain", produces = FileConstants.OCTET_STREAM)
	public ResponseEntity<byte[]> downloadChainLogFile(@RequestParam(name = "id", required = true) String id) {
		logger.info("post request to download pipeline log");
		try {
			byte[] bytesArray = fileService.downloadLogFile(id, IAIJobConstants.CHAINLOGPATH);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + id + ".log").body(bytesArray);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Download native script file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the response entity
	 */
	@GetMapping(path = "/download/native/{cname}/{org}", produces = FileConstants.OCTET_STREAM)
	public ResponseEntity<byte[]> downloadNativeScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "filename") String filename) {
		logger.info("request to download native script file");
		try {
			byte[] bytesArray = fileService.downloadNativeScriptFile(cname, org, filename, FileConstants.NATIVE_CODE);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + filename).body(bytesArray);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Download script file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the response entity
	 */
	@GetMapping(path = "/download/script/{cname}/{org}", produces = FileConstants.OCTET_STREAM)
	public ResponseEntity<byte[]> downloadScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "filename") String filename) {
		logger.info("request to download script file");
		try {
			byte[] bytesArray = fileService.downloadScriptFile(cname, org, filename, FileConstants.SCRIPT_CODE);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + filename).body(bytesArray);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Download drag file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the response entity
	 */
	@GetMapping(path = "/download/drag/{cname}/{org}", produces = FileConstants.OCTET_STREAM)
	public ResponseEntity<byte[]> downloadDragFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "filename") String filename) {
		logger.info("request to download draganddrop file");
		try {
			byte[] bytesArray = fileService.downloadDragAndDropFile(cname, org, filename,
					FileConstants.DRAGANDDROP_CODE);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + filename).body(bytesArray);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Read file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the response entity
	 */
	@GetMapping(path = "/read/{cname}/{org}")
	public ResponseEntity<byte[]> readFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "file") String filename) {
		logger.info("request to read native script");
		InputStream in = null;
		try {
			if(remoteScript.equals("true")) {
				Git git = githubservice.getGitHubRepository(org);
				
				Boolean result = githubservice.pull(git);
				
				String scriptPath = githubservice.fetchFileFromLocalRepo(cname, org);
				
				if(scriptPath!=null) {
					in = new FileInputStream(scriptPath);
				}
			
			}
			else {
				in = fileService.getNativeCodeInputStream(cname, org, filename);
			}

			//Path path = fileService.getFileInServer(in, filename, FileConstants.NATIVE_CODE);
			//return new ResponseEntity<>(ICIPUtils.readFile(path), HttpStatus.OK);
			return new ResponseEntity<byte[]>(in.readAllBytes(), new HttpHeaders(), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		finally {
			if(in!=null) {
				try {
					in.close();
				 } catch (IOException e) {
					 logger.error(e.getMessage(), e);
				 }
			}
		}
	}

	/**
	 * Read agents file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the response entity
	 */
	@GetMapping(path = "/read/agents/{cname}/{org}")
	public ResponseEntity<List<String>> readAgentsFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "file") String filename) {
		logger.info("request to read agents");
		try {
			Path path = fileService.returnPath(FileConstants.AGENTS_CODE, filename);
			return new ResponseEntity<>(ICIPUtils.readFile(path), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Read sample agents file.
	 *
	 * @param agenttype the agenttype
	 * @return the response entity
	 */
	@GetMapping(path = "/read/sample/agents")
	public ResponseEntity<List<String>> readSampleAgentsFile(@RequestParam(name = "agenttype") String agenttype) {
		logger.info("request to read sample agents");
		try {
			Path path = fileService.returnDefaultConfigPath(agenttype.toLowerCase(),
					fileService.agentsConfig.getSampleFile(agenttype));
			return new ResponseEntity<>(ICIPUtils.readFile(path), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Read base agents file.
	 *
	 * @param agenttype the agenttype
	 * @return the response entity
	 */
	@GetMapping(path = "/read/base/agents")
	public ResponseEntity<List<String>> readBaseAgentsFile(@RequestParam(name = "agenttype") String agenttype) {
		logger.info("request to read base agents");
		try {
			Path path = fileService.returnDefaultConfigPath(agenttype.toLowerCase(),
					fileService.agentsConfig.getBaseFile(agenttype));
			return new ResponseEntity<>(ICIPUtils.readFile(path), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Read script file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the response entity
	 */
	@GetMapping(path = "/read/script/{cname}/{org}")
	public ResponseEntity<List<String>> readScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "file") String filename) {
		logger.info("request to read script");
		InputStream in = null;
		try {
			in = fileService.getScriptCodeInputStream(cname, org, filename);
			Path path = fileService.getFileInServer(in, filename, FileConstants.SCRIPT_CODE);
			return new ResponseEntity<>(ICIPUtils.readFile(path), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		finally {
			if(in!=null) {
				try {
					in.close();
				 } catch (IOException e) {
					 logger.error(e.getMessage(), e);
				 }
			}
		}
	}

	/**
	 * Read drag file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the response entity
	 */
	@GetMapping(path = "/read/drag/{cname}/{org}")
	public ResponseEntity<List<String>> readDragFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "file") String filename) {
		logger.info("request to read draganddrop file");
		InputStream in = null;
		try {
			in = fileService.getDragAndDropCodeInputStream(cname, org, filename);
			Path path = fileService.getFileInServer(in, filename, FileConstants.DRAGANDDROP_CODE);
			return new ResponseEntity<>(ICIPUtils.readFile(path), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		finally {
			if(in!=null) {
				try {
					in.close();
				 } catch (IOException e) {
					 logger.error(e.getMessage(), e);
				 }
			}
		}
	}

	/**
	 * Creates the native script file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileName the file name
	 * @param fileType the file type
	 * @param script   the script
	 * @return the response entity
	 */
	@PostMapping(path = "/create/{cname}/{org}/{fileType}",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<String> createNativeScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "file") String fileName,
			@PathVariable(name = "fileType") String fileType, @RequestParam(value = "scriptFile", required = true) MultipartFile script) {
		logger.info("request to create native script file");
		try {
			return new ResponseEntity<>(fileService.writeNativeFile(cname, org, fileName, fileType, script), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Creates the agents file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileName the file name
	 * @param fileType the file type
	 * @param script   the script
	 * @return the response entity
	 */
	@PostMapping(path = "/create/agents/{cname}/{org}/{fileType}")
	public ResponseEntity<String> createAgentsFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "file") String fileName,
			@PathVariable(name = "fileType") String fileType, @RequestBody String[] script) {
		logger.info("request to create agents file");
		try {
			return new ResponseEntity<>( fileService.writeAgentsFile(cname, org, fileType, script), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Creates the script file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileName the file name
	 * @param fileType the file type
	 * @param script   the script
	 * @return the response entity
	 */
	@PostMapping(path = "/create/script/{cname}/{org}/{fileType}")
	public ResponseEntity<String> createScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "file") String fileName,
			@PathVariable(name = "fileType") String fileType, @RequestBody String[] script) {
		logger.info("request to create script file");
		try {
			return new ResponseEntity<>(fileService.writeScriptFile(cname, org, fileName, fileType, script), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Creates the drag file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileName the file name
	 * @param fileType the file type
	 * @param data     the data
	 * @return the response entity
	 */
	@PostMapping(path = "/create/drag/{cname}/{org}/{fileType}")
	public ResponseEntity<String> createDragFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "file") String fileName,
			@PathVariable(name = "fileType") String fileType, @RequestBody String data) {
		logger.info("request to create draganddrop file");
		try {
			return new ResponseEntity<>(fileService.writeDragAndDropFile(cname, org, fileName, fileType, data), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Read config.
	 *
	 * @param agentType the agent type
	 * @param cname     the cname
	 * @param org       the org
	 * @return the response entity
	 */
	@GetMapping(path = "/readConfig/{agenttype}")
	public ResponseEntity<String> readConfig(@PathVariable(name = "agenttype") String agentType,
			@RequestParam(defaultValue = "", name = "cname", required = false) String cname,
			@RequestParam(defaultValue = "", name = "org", required = false) String org) {
		logger.info("request to read config file");
		try {
			return new ResponseEntity<>(fileService.readConfig(agentType, cname, org), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Write config.
	 *
	 * @param agentType the agent type
	 * @param cname     the cname
	 * @param org       the org
	 * @param config    the config
	 * @return the response entity
	 */
	@PostMapping(path = "/writeConfig/{agenttype}")
	public ResponseEntity<String> writeConfig(@PathVariable(name = "agenttype") String agentType,
			@RequestParam(defaultValue = "", name = "cname", required = false) String cname,
			@RequestParam(defaultValue = "", name = "org", required = false) String org, @RequestBody String config) {
		logger.info("request to write config file");
		try {
			fileService.writeConfig(agentType, cname, org, config);
			return new ResponseEntity<>("Config file updated", HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Read xml.
	 *
	 * @param agentType the agent type
	 * @param cname     the cname
	 * @param org       the org
	 * @return the response entity
	 */
	@GetMapping(path = "/readXml/{agenttype}")
	public ResponseEntity<String> readXml(@PathVariable(name = "agenttype") String agentType,
			@RequestParam(defaultValue = "", name = "cname", required = false) String cname,
			@RequestParam(defaultValue = "", name = "org", required = false) String org) {
		logger.info("request to read xml file");
		try {
			return new ResponseEntity<>(fileService.readXml(agentType, cname, org).toString(), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Write xml.
	 *
	 * @param agentType the agent type
	 * @param cname     the cname
	 * @param org       the org
	 * @param config    the config
	 * @return the response entity
	 */
	@PostMapping(path = "/writeXml/{agenttype}")
	public ResponseEntity<String> writeXml(@PathVariable(name = "agenttype") String agentType,
			@RequestParam(defaultValue = "", name = "cname", required = false) String cname,
			@RequestParam(defaultValue = "", name = "org", required = false) String org, @RequestBody String config) {
		logger.info("request to write xmlconfig file");
		try {
			return new ResponseEntity<>( fileService.writeXml(agentType, cname, org, config), HttpStatus.OK);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Download agents file.
	 *
	 * @param cname     the cname
	 * @param org       the org
	 * @param filename  the filename
	 * @param agenttype the agenttype
	 * @param paths     the paths
	 * @return the response entity
	 */
	@PostMapping(path = "/download/agents/{cname}/{org}", produces = FileConstants.OCTET_STREAM)
	public ResponseEntity<byte[]> downloadAgentsFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestParam(name = "filename") String filename,
			@RequestParam(name = "agenttype") String agenttype, @RequestBody String paths) {
		logger.info("request to download agents file");
		try {
			Gson gson = new Gson();
			JsonArray pathArray = gson.fromJson(paths, JsonArray.class);
			byte[] bytesArray = fileService.downloadAgentsFile(cname, org, filename, agenttype,
					FileConstants.AGENTS_CODE, pathArray);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION,
							FileConstants.ATTACHMENT + String.format("%s_%s.zip", cname, org))
					.body(bytesArray);
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
	}
	
	@GetMapping(path = "/cloneGitRepoAndPushToS3/{datasetId}/{org}")
	public ResponseEntity<String> cloneGitRepo(@PathVariable(name = "datasetId") String datasetId,
			@PathVariable(name = "org") String org) {
		logger.info("CloneGitRepo And Push To S3 for :{} - {}", datasetId, org);
		try {
			String cloneGitRepoAndPushToS3 = githubservice.cloneGitRepoAndPushToS3(datasetId, org);
			if (cloneGitRepoAndPushToS3 != null && !cloneGitRepoAndPushToS3.isEmpty())
				return new ResponseEntity<>(cloneGitRepoAndPushToS3, HttpStatus.OK);
			else {
				Throwable rootcause = ExceptionUtil.findRootCause(new Exception("error occurred"));
				ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(),
						"error occurred");
				return new ResponseEntity<>("There is an application error, please contact the application admin",
						new HttpHeaders(), apiError.getStatus());
			}
		} catch (Exception ex) {
			logger.error(ex.getMessage(), ex);
			Throwable rootcause = ExceptionUtil.findRootCause(ex);
			ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, rootcause.getMessage(),
					"error occurred");
			return new ResponseEntity<>("There is an application error, please contact the application admin",
					new HttpHeaders(), apiError.getStatus());
		}
	}

}