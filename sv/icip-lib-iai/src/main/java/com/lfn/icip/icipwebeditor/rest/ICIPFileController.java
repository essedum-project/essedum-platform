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

package com.lfn.icip.icipwebeditor.rest;

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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.exceptions.ApiError;
import com.lfn.ai.comm.lib.util.exceptions.ExceptionUtil;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.exception.*;
import com.lfn.icip.icipwebeditor.file.service.ICIPFileService;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.service.impl.GitHubService;

import io.micrometer.core.annotation.Timed;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPFileController.
 *
 * @author essedum
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
	
	@EssedumProperty("icip.script.github.enabled")
	private String remoteScript;

	/**
	 * Upload file.
	 *
	 * @param file the file
	 * @return the response entity
	 */
	@PostMapping(path = "/upload")
	public ResponseEntity<String> uploadFile(@RequestBody MultipartFile file) {
		logger.info("request to upload jar-file");

		try {
			// Validate input
			if (file == null || file.isEmpty()) {
				throw new InvalidRequestException("File cannot be null or empty");
			}

			String result = fileService.storeFile(file, FileConstants.JAR);
			logger.info("Successfully uploaded jar file: {}", file.getOriginalFilename());

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception e) {
			logger.error("Error uploading jar file: {}", e.getMessage(), e);
			throw new FileUploadException("Failed to upload jar file", e);
		}
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
		logger.info("request to upload agent file for cname={}, org={}, agentType={}", cname, org, agentType);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (file == null || file.isEmpty()) {
				throw new InvalidRequestException("File cannot be null or empty");
			}
			if (metadata == null || metadata.isBlank()) {
				throw new InvalidRequestException("Chunk metadata cannot be null or empty");
			}

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

			logger.info("Successfully saved chunk for cname={}, org={}", cname, org);
			return new ResponseEntity<>(pathStrs, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error saving chunk for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to save file chunks for cname=%s, org=%s", cname, org), ex);
		}
	}

	/**
	 * Upload pipeline file.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @param file  the file
	 * @return the response entity
	 */
	@PostMapping(path = "/pipeline/upload/{cname}/{org}")
	public ResponseEntity<String> uploadPipelineFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestBody MultipartFile file) {
		logger.info("request to upload pipeline file for cname={}, org={}", cname, org);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (file == null || file.isEmpty()) {
				throw new InvalidRequestException("File cannot be null or empty");
			}

			logger.info(FileConstants.CHECKING_FILE);
			List<String> acceptanceArray = new ArrayList<>(Arrays.asList("jar", "py", "egg", "zip"));
			String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();

			if (acceptanceArray.indexOf(fileExtension) == -1) {
				throw new InvalidRequestException(
					String.format("Invalid file format: %s. Accepted formats: jar, py, egg, zip", fileExtension));
			}

			logger.info("request to upload binary-file with extension: {}", fileExtension);
			String result = fileService.storeBinaryFile(cname, org, file);
			logger.info("Successfully uploaded pipeline file for cname={}, org={}", cname, org);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error uploading pipeline file for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to upload pipeline file for cname=%s, org=%s", cname, org), ex);
		}
	}

	/**
	 * Upload pipeline native script file.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @param file  the file
	 * @return the response entity
	 */
	@PostMapping(path = "/pipeline/native/upload/{cname}/{org}")
	public ResponseEntity<String> uploadPipelineNativeScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestBody MultipartFile file) {
		logger.info("request to upload native script for cname={}, org={}", cname, org);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (file == null || file.isEmpty()) {
				throw new InvalidRequestException("File cannot be null or empty");
			}

			logger.info(FileConstants.CHECKING_FILE);
			List<String> acceptanceArray = new ArrayList<>(Arrays.asList("js", "py"));
			String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();

			if (acceptanceArray.indexOf(fileExtension) == -1) {
				throw new InvalidRequestException(
					String.format("Invalid file format: %s. Accepted formats: js, py", fileExtension));
			}

			logger.info("request to upload native script code with extension: {}", fileExtension);
			String result = fileService.storeNativeScriptFile(cname, org, file);
			logger.info("Successfully uploaded native script for cname={}, org={}", cname, org);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error uploading native script for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to upload native script for cname=%s, org=%s", cname, org), ex);
		}
	}

	/**
	 * Upload pipeline script file.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @param file  the file
	 * @return the response entity
	 */
	@PostMapping(path = "/pipeline/script/upload/{cname}/{org}")
	public ResponseEntity<String> uploadPipelineScriptFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestBody MultipartFile file) {
		logger.info("request to upload script file for cname={}, org={}", cname, org);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (file == null || file.isEmpty()) {
				throw new InvalidRequestException("File cannot be null or empty");
			}

			logger.info(FileConstants.CHECKING_FILE);
			List<String> acceptanceArray = new ArrayList<>(Arrays.asList("py"));
			String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();

			if (acceptanceArray.indexOf(fileExtension) == -1) {
				throw new InvalidRequestException(
					String.format("Invalid file format: %s. Accepted format: py", fileExtension));
			}

			logger.info("request to upload script code");
			String result = fileService.storeScriptFile(cname, org, file);
			logger.info("Successfully uploaded script file for cname={}, org={}", cname, org);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error uploading script file for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to upload script file for cname=%s, org=%s", cname, org), ex);
		}
	}

	/**
	 * Upload pipeline drag file.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @param file  the file
	 * @return the response entity
	 */
	@PostMapping(path = "/pipeline/drag/upload/{cname}/{org}")
	public ResponseEntity<String> uploadPipelineDragFile(@PathVariable(name = "cname") String cname,
			@PathVariable(name = "org") String org, @RequestBody MultipartFile file) {
		logger.info("request to upload drag-and-drop file for cname={}, org={}", cname, org);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (file == null || file.isEmpty()) {
				throw new InvalidRequestException("File cannot be null or empty");
			}

			logger.info(FileConstants.CHECKING_FILE);
			List<String> acceptanceArray = new ArrayList<>(Arrays.asList("yaml"));
			String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();

			if (acceptanceArray.indexOf(fileExtension) == -1) {
				throw new InvalidRequestException(
					String.format("Invalid file format: %s. Accepted format: yaml", fileExtension));
			}

			logger.info("request to upload draganddrop code");
			String result = fileService.storeDragAndDropFile(cname, org, file);
			logger.info("Successfully uploaded drag-and-drop file for cname={}, org={}", cname, org);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error uploading drag-and-drop file for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to upload drag-and-drop file for cname=%s, org=%s", cname, org), ex);
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
		logger.info("request to download binary file for cname={}, org={}, filename={}", cname, org, filename);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}

			byte[] bytesArray = fileService.downloadBinaryFile(cname, org, filename, FileConstants.BINARY);

			if (bytesArray == null || bytesArray.length == 0) {
				throw new ResourceNotFoundException(
					String.format("File '%s' not found for cname=%s, org=%s", filename, cname, org));
			}

			logger.info("Successfully downloaded binary file: {}", filename);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + filename).body(bytesArray);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error downloading file {} for cname={}, org={}: {}", filename, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to download file '%s' for cname=%s, org=%s", filename, cname, org), ex);
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
		logger.info("request to download pipeline log for id: {}", id);

		try {
			// Validate input
			if (id == null || id.isBlank()) {
				throw new InvalidRequestException("Pipeline ID cannot be null or empty");
			}

			byte[] bytesArray = fileService.downloadLogFile(id, IAIJobConstants.PIPELINELOGPATH);

			if (bytesArray == null || bytesArray.length == 0) {
				throw new ResourceNotFoundException(String.format("Pipeline log file for ID '%s' not found", id));
			}

			logger.info("Successfully downloaded pipeline log for id: {}", id);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + id + ".log").body(bytesArray);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error downloading pipeline log for id {}: {}", id, ex.getMessage(), ex);
			throw new FileUploadException(String.format("Failed to download pipeline log for ID '%s'", id), ex);
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
		logger.info("request to download chain log for id: {}", id);

		try {
			// Validate input
			if (id == null || id.isBlank()) {
				throw new InvalidRequestException("Chain ID cannot be null or empty");
			}

			byte[] bytesArray = fileService.downloadLogFile(id, IAIJobConstants.CHAINLOGPATH);

			if (bytesArray == null || bytesArray.length == 0) {
				throw new ResourceNotFoundException(String.format("Chain log file for ID '%s' not found", id));
			}

			logger.info("Successfully downloaded chain log for id: {}", id);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + id + ".log").body(bytesArray);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error downloading chain log for id {}: {}", id, ex.getMessage(), ex);
			throw new FileUploadException(String.format("Failed to download chain log for ID '%s'", id), ex);
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
		logger.info("request to download native script file for cname={}, org={}, filename={}", cname, org, filename);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}

			byte[] bytesArray = fileService.downloadNativeScriptFile(cname, org, filename, FileConstants.NATIVE_CODE);

			if (bytesArray == null || bytesArray.length == 0) {
				throw new ResourceNotFoundException(
					String.format("Native script file '%s' not found for cname=%s, org=%s", filename, cname, org));
			}

			logger.info("Successfully downloaded native script file: {}", filename);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + filename).body(bytesArray);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error downloading native script {} for cname={}, org={}: {}", filename, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to download native script '%s' for cname=%s, org=%s", filename, cname, org), ex);
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
		logger.info("request to download script file for cname={}, org={}, filename={}", cname, org, filename);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}

			byte[] bytesArray = fileService.downloadScriptFile(cname, org, filename, FileConstants.SCRIPT_CODE);

			if (bytesArray == null || bytesArray.length == 0) {
				throw new ResourceNotFoundException(
					String.format("Script file '%s' not found for cname=%s, org=%s", filename, cname, org));
			}

			logger.info("Successfully downloaded script file: {}", filename);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + filename).body(bytesArray);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error downloading script {} for cname={}, org={}: {}", filename, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to download script '%s' for cname=%s, org=%s", filename, cname, org), ex);
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
		logger.info("request to download draganddrop file for cname={}, org={}, filename={}", cname, org, filename);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}

			byte[] bytesArray = fileService.downloadDragAndDropFile(cname, org, filename, FileConstants.DRAGANDDROP_CODE);

			if (bytesArray == null || bytesArray.length == 0) {
				throw new ResourceNotFoundException(
					String.format("Drag-and-drop file '%s' not found for cname=%s, org=%s", filename, cname, org));
			}

			logger.info("Successfully downloaded drag-and-drop file: {}", filename);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION, FileConstants.ATTACHMENT + filename).body(bytesArray);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error downloading drag-and-drop {} for cname={}, org={}: {}", filename, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to download drag-and-drop file '%s' for cname=%s, org=%s", filename, cname, org), ex);
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
		logger.info("request to read native script for cname={}, org={}, filename={}", cname, org, filename);

		InputStream in = null;
		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}

			if(remoteScript.equals("true")) {
				Git git = githubservice.getGitHubRepository(org);
				Boolean result = githubservice.pull(git);
				String scriptPath = githubservice.fetchFileFromLocalRepo(cname, org);
				
				if(scriptPath != null) {
					in = new FileInputStream(scriptPath);
				} else {
					throw new ResourceNotFoundException(
						String.format("Script file not found in GitHub repository for cname=%s, org=%s", cname, org));
				}
			} else {
				in = fileService.getNativeCodeInputStream(cname, org, filename);
			}

			if (in == null) {
				throw new ResourceNotFoundException(
					String.format("Native script '%s' not found for cname=%s, org=%s", filename, cname, org));
			}

			byte[] content = in.readAllBytes();
			logger.info("Successfully read native script file: {}", filename);
			return new ResponseEntity<>(content, new HttpHeaders(), HttpStatus.OK);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error reading native script {} for cname={}, org={}: {}", filename, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to read native script '%s' for cname=%s, org=%s", filename, cname, org), ex);
		} finally {
			if(in != null) {
				try {
					in.close();
				} catch (IOException e) {
					logger.error("Error closing input stream: {}", e.getMessage(), e);
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
		logger.info("request to read agents for cname={}, org={}, filename={}", cname, org, filename);

		try {
			// Validate inputs
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}

			Path path = fileService.returnPath(FileConstants.AGENTS_CODE, filename);
			if (path == null || !java.nio.file.Files.exists(path)) {
				throw new ResourceNotFoundException(
					String.format("Agents file '%s' not found", filename));
			}

			List<String> content = ICIPUtils.readFile(path);
			logger.info("Successfully read agents file: {}", filename);

			return new ResponseEntity<>(content, HttpStatus.OK);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error reading agents file {}: {}", filename, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to read agents file '%s'", filename), ex);
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
		logger.info("request to read sample agents for type: {}", agenttype);

		try {
			// Validate input
			if (agenttype == null || agenttype.isBlank()) {
				throw new InvalidRequestException("Agent type cannot be null or empty");
			}

			Path path = fileService.returnDefaultConfigPath(agenttype.toLowerCase(),
					fileService.agentsConfig.getSampleFile(agenttype));

			if (path == null || !java.nio.file.Files.exists(path)) {
				throw new ResourceNotFoundException(
					String.format("Sample agents file for type '%s' not found", agenttype));
			}

			List<String> content = ICIPUtils.readFile(path);
			logger.info("Successfully read sample agents file for type: {}", agenttype);

			return new ResponseEntity<>(content, HttpStatus.OK);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error reading sample agents for type {}: {}", agenttype, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to read sample agents file for type '%s'", agenttype), ex);
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
		logger.info("request to read base agents for type: {}", agenttype);

		try {
			// Validate input
			if (agenttype == null || agenttype.isBlank()) {
				throw new InvalidRequestException("Agent type cannot be null or empty");
			}

			Path path = fileService.returnDefaultConfigPath(agenttype.toLowerCase(),
					fileService.agentsConfig.getBaseFile(agenttype));

			if (path == null || !java.nio.file.Files.exists(path)) {
				throw new ResourceNotFoundException(
					String.format("Base agents file for type '%s' not found", agenttype));
			}

			List<String> content = ICIPUtils.readFile(path);
			logger.info("Successfully read base agents file for type: {}", agenttype);

			return new ResponseEntity<>(content, HttpStatus.OK);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error reading base agents for type {}: {}", agenttype, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to read base agents file for type '%s'", agenttype), ex);
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
		logger.info("request to read script for cname={}, org={}, filename={}", cname, org, filename);

		InputStream in = null;
		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}

			in = fileService.getScriptCodeInputStream(cname, org, filename);
			if (in == null) {
				throw new ResourceNotFoundException(
					String.format("Script file '%s' not found for cname=%s, org=%s", filename, cname, org));
			}

			Path path = fileService.getFileInServer(in, filename, FileConstants.SCRIPT_CODE);
			List<String> content = ICIPUtils.readFile(path);
			logger.info("Successfully read script file: {}", filename);

			return new ResponseEntity<>(content, HttpStatus.OK);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error reading script {} for cname={}, org={}: {}", filename, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to read script file '%s' for cname=%s, org=%s", filename, cname, org), ex);
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e) {
					logger.error("Error closing input stream: {}", e.getMessage(), e);
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
		logger.info("request to read drag-and-drop file for cname={}, org={}, filename={}", cname, org, filename);

		InputStream in = null;
		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}

			in = fileService.getDragAndDropCodeInputStream(cname, org, filename);
			if (in == null) {
				throw new ResourceNotFoundException(
					String.format("Drag-and-drop file '%s' not found for cname=%s, org=%s", filename, cname, org));
			}

			Path path = fileService.getFileInServer(in, filename, FileConstants.DRAGANDDROP_CODE);
			List<String> content = ICIPUtils.readFile(path);
			logger.info("Successfully read drag-and-drop file: {}", filename);

			return new ResponseEntity<>(content, HttpStatus.OK);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error reading drag-and-drop {} for cname={}, org={}: {}", filename, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to read drag-and-drop file '%s' for cname=%s, org=%s", filename, cname, org), ex);
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e) {
					logger.error("Error closing input stream: {}", e.getMessage(), e);
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
	public ResponseEntity<List<String>> createNativeScriptFile(@PathVariable(name = "cname") String cname,
                                                         @PathVariable(name = "org") String org, @RequestParam(name = "file") String fileName,
                                                         @PathVariable(name = "fileType") String fileType, @RequestParam(value = "scriptFile", required = true) MultipartFile script) {
		logger.info("request to create native script file for cname={}, org={}, fileName={}, fileType={}", cname, org, fileName, fileType);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (fileName == null || fileName.isBlank()) {
				throw new InvalidRequestException("File name cannot be null or empty");
			}
			if (fileType == null || fileType.isBlank()) {
				throw new InvalidRequestException("File type cannot be null or empty");
			}
			if (script == null || script.isEmpty()) {
				throw new InvalidRequestException("Script file cannot be null or empty");
			}

			List<String> result = fileService.writeNativeFile(cname, org, fileName, fileType, script);
			logger.info("Successfully created native script file: {}", fileName);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error creating native script {} for cname={}, org={}: {}", fileName, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to create native script file '%s' for cname=%s, org=%s", fileName, cname, org), ex);
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
		logger.info("request to create agents file for cname={}, org={}, fileType={}", cname, org, fileType);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (fileType == null || fileType.isBlank()) {
				throw new InvalidRequestException("File type cannot be null or empty");
			}
			if (script == null || script.length == 0) {
				throw new InvalidRequestException("Script content cannot be null or empty");
			}

			String result = fileService.writeAgentsFile(cname, org, fileType, script);
			logger.info("Successfully created agents file for cname={}, org={}", cname, org);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error creating agents file for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to create agents file for cname=%s, org=%s", cname, org), ex);
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
		logger.info("request to create script file for cname={}, org={}, fileName={}, fileType={}", cname, org, fileName, fileType);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (fileName == null || fileName.isBlank()) {
				throw new InvalidRequestException("File name cannot be null or empty");
			}
			if (fileType == null || fileType.isBlank()) {
				throw new InvalidRequestException("File type cannot be null or empty");
			}
			if (script == null || script.length == 0) {
				throw new InvalidRequestException("Script content cannot be null or empty");
			}

			String result = fileService.writeScriptFile(cname, org, fileName, fileType, script);
			logger.info("Successfully created script file: {}", fileName);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error creating script {} for cname={}, org={}: {}", fileName, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to create script file '%s' for cname=%s, org=%s", fileName, cname, org), ex);
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
		logger.info("request to create drag-and-drop file for cname={}, org={}, fileName={}, fileType={}", cname, org, fileName, fileType);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (fileName == null || fileName.isBlank()) {
				throw new InvalidRequestException("File name cannot be null or empty");
			}
			if (fileType == null || fileType.isBlank()) {
				throw new InvalidRequestException("File type cannot be null or empty");
			}
			if (data == null || data.isBlank()) {
				throw new InvalidRequestException("File data cannot be null or empty");
			}

			String result = fileService.writeDragAndDropFile(cname, org, fileName, fileType, data);
			logger.info("Successfully created drag-and-drop file: {}", fileName);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error creating drag-and-drop {} for cname={}, org={}: {}", fileName, cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to create drag-and-drop file '%s' for cname=%s, org=%s", fileName, cname, org), ex);
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
		logger.info("request to read config file for agentType: {}", agentType);

		try {
			// Validate input
			if (agentType == null || agentType.isBlank()) {
				throw new InvalidRequestException("Agent type cannot be null or empty");
			}

			String config = fileService.readConfig(agentType, cname, org);
			logger.info("Successfully read config file for agentType: {}", agentType);

			return new ResponseEntity<>(config, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error reading config for agentType {}: {}", agentType, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to read config for agentType '%s'", agentType), ex);
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
		logger.info("request to write config file for agentType: {}", agentType);

		try {
			// Validate inputs
			if (agentType == null || agentType.isBlank()) {
				throw new InvalidRequestException("Agent type cannot be null or empty");
			}
			if (config == null || config.isBlank()) {
				throw new InvalidRequestException("Config data cannot be null or empty");
			}

			fileService.writeConfig(agentType, cname, org, config);
			logger.info("Successfully wrote config file for agentType: {}", agentType);

			return new ResponseEntity<>("Config file updated", HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error writing config for agentType {}: {}", agentType, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to write config for agentType '%s'", agentType), ex);
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
		logger.info("request to read XML file for agentType: {}", agentType);

		try {
			// Validate input
			if (agentType == null || agentType.isBlank()) {
				throw new InvalidRequestException("Agent type cannot be null or empty");
			}

			String xml = fileService.readXml(agentType, cname, org).toString();
			logger.info("Successfully read XML file for agentType: {}", agentType);

			return new ResponseEntity<>(xml, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error reading XML for agentType {}: {}", agentType, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to read XML for agentType '%s'", agentType), ex);
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
		logger.info("request to write XML config file for agentType: {}", agentType);

		try {
			// Validate inputs
			if (agentType == null || agentType.isBlank()) {
				throw new InvalidRequestException("Agent type cannot be null or empty");
			}
			if (config == null || config.isBlank()) {
				throw new InvalidRequestException("XML config data cannot be null or empty");
			}

			String result = fileService.writeXml(agentType, cname, org, config);
			logger.info("Successfully wrote XML config file for agentType: {}", agentType);

			return new ResponseEntity<>(result, HttpStatus.OK);

		} catch (InvalidRequestException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error writing XML for agentType {}: {}", agentType, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to write XML for agentType '%s'", agentType), ex);
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
		logger.info("request to download agents file for cname={}, org={}, agenttype={}", cname, org, agenttype);

		try {
			// Validate inputs
			if (cname == null || cname.isBlank()) {
				throw new InvalidRequestException("Customer name (cname) cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}
			if (filename == null || filename.isBlank()) {
				throw new InvalidRequestException("Filename cannot be null or empty");
			}
			if (agenttype == null || agenttype.isBlank()) {
				throw new InvalidRequestException("Agent type cannot be null or empty");
			}
			if (paths == null || paths.isBlank()) {
				throw new InvalidRequestException("Paths data cannot be null or empty");
			}

			Gson gson = new Gson();
			JsonArray pathArray = gson.fromJson(paths, JsonArray.class);
			byte[] bytesArray = fileService.downloadAgentsFile(cname, org, filename, agenttype,
					FileConstants.AGENTS_CODE, pathArray);

			if (bytesArray == null || bytesArray.length == 0) {
				throw new ResourceNotFoundException(
					String.format("Agents file not found for cname=%s, org=%s", cname, org));
			}

			logger.info("Successfully downloaded agents file for cname={}, org={}", cname, org);
			return ResponseEntity.ok().contentLength(bytesArray.length)
					.header(HttpHeaders.CONTENT_TYPE, FileConstants.OCTET_STREAM)
					.header(HttpHeaders.CONTENT_DISPOSITION,
							FileConstants.ATTACHMENT + String.format("%s_%s.zip", cname, org))
					.body(bytesArray);

		} catch (InvalidRequestException | ResourceNotFoundException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error downloading agents file for cname={}, org={}: {}", cname, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to download agents file for cname=%s, org=%s", cname, org), ex);
		}
	}

	@GetMapping(path = "/cloneGitRepoAndPushToS3/{datasetId}/{org}")
	public ResponseEntity<String> cloneGitRepo(@PathVariable(name = "datasetId") String datasetId,
			@PathVariable(name = "org") String org) {
		logger.info("CloneGitRepo And Push To S3 for datasetId: {}, org: {}", datasetId, org);

		try {
			// Validate inputs
			if (datasetId == null || datasetId.isBlank()) {
				throw new InvalidRequestException("Dataset ID cannot be null or empty");
			}
			if (org == null || org.isBlank()) {
				throw new InvalidRequestException("Organization (org) cannot be null or empty");
			}

			String cloneGitRepoAndPushToS3 = githubservice.cloneGitRepoAndPushToS3(datasetId, org);

			if (cloneGitRepoAndPushToS3 != null && !cloneGitRepoAndPushToS3.isEmpty()) {
				logger.info("Successfully cloned Git repo and pushed to S3 for datasetId: {}", datasetId);
				return new ResponseEntity<>(cloneGitRepoAndPushToS3, HttpStatus.OK);
			} else {
				throw new FileUploadException("Error occurred while cloning Git repo and pushing to S3");
			}

		} catch (InvalidRequestException | FileUploadException e) {
			throw e;
		} catch (Exception ex) {
			logger.error("Error cloning Git repo for datasetId {}, org {}: {}", datasetId, org, ex.getMessage(), ex);
			throw new FileUploadException(
				String.format("Failed to clone Git repo and push to S3 for datasetId=%s, org=%s", datasetId, org), ex);
		}
	}

}

