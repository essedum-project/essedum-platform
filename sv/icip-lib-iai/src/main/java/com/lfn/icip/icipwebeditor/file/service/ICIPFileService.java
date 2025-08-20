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

package com.lfn.icip.icipwebeditor.file.service;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.sql.Blob;
import java.sql.SQLException;
import java.time.Instant;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.sql.rowset.serial.SerialBlob;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.PullResult;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.yaml.snakeyaml.Yaml;

import com.google.common.io.Files;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.icip.dataset.service.impl.ICIPDatasetFilesService;
import com.lfn.icip.icipwebeditor.config.ICIPAgentsConfig;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.exception.IcipIaiException;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.model.ICIPBinaryFiles;
import com.lfn.icip.icipwebeditor.model.ICIPDragAndDrop;
import com.lfn.icip.icipwebeditor.model.ICIPNativeScript;
import com.lfn.icip.icipwebeditor.model.ICIPScript;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;
import com.lfn.icip.icipwebeditor.service.IICIPNativeScriptService;
import com.lfn.icip.icipwebeditor.service.IICIPStreamingServiceService;
import com.lfn.icip.icipwebeditor.service.impl.GitHubService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPBinaryFilesService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPDragAndDropService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPPipelineService;
import com.lfn.icip.icipwebeditor.service.impl.ICIPScriptService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPFileService.
 *
 * @author essedum
 */
@Service
@RefreshScope
public class ICIPFileService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPFileService.class);

	/** The binary service. */
	private ICIPBinaryFilesService binaryService;

	/** The native script service. */
	private IICIPNativeScriptService nativeScriptService;

	/** The script service. */
	private ICIPScriptService scriptService;

	/** The drag and drop service. */
	private ICIPDragAndDropService dragAndDropService;

	/** The pipeline service. */
	private ICIPPipelineService pipelineService;

	/** The agents config. */
	public ICIPAgentsConfig agentsConfig;

	/** The dataset file service. */
	@Lazy
	@Autowired
	private ICIPDatasetFilesService datasetFileService;

	/** The folder path. */
	@EssedumProperty("icip.fileuploadDir")
	private String folderPath;

	/** The agent path. */
	@EssedumProperty("icip.agentsDir")
	private String agentPath;
	
	@Autowired
	private GitHubService githubservice;
	
	@Autowired
	private ConstantsService constantsService;
	
	@Autowired
	private IICIPStreamingServiceService streamingServicesService;	
	/**
	 * Instantiates a new ICIP file service.
	 *
	 * @param binaryService       the binary service
	 * @param nativeScriptService the native script service
	 * @param scriptService       the script service
	 * @param dragAndDropService  the drag and drop service
	 * @param pipelineService     the pipeline service
	 * @param agentsConfig        the agents config
	 */
	public ICIPFileService(ICIPBinaryFilesService binaryService, IICIPNativeScriptService nativeScriptService,
			ICIPScriptService scriptService, ICIPDragAndDropService dragAndDropService,
			ICIPPipelineService pipelineService, ICIPAgentsConfig agentsConfig) {
		super();
		this.binaryService = binaryService;
		this.nativeScriptService = nativeScriptService;
		this.scriptService = scriptService;
		this.dragAndDropService = dragAndDropService;
		this.pipelineService = pipelineService;
		this.agentsConfig = agentsConfig;
	}

	/**
	 * Store tmp file.
	 *
	 * @param file           the file
	 * @param targetLocation the target location
	 * @return the string
	 * @throws IOException      Signals that an I/O exception has occurred.
	 * @throws IcipIaiException the icip iai exception
	 */
	public String storeTmpFile(MultipartFile file, String targetLocation) throws IOException, IcipIaiException {
		String fileExtension = "." + Files.getFileExtension(file.getOriginalFilename());
		String fileName = ICIPUtils
				.removeSpecialCharacter(StringUtils.cleanPath(file.getOriginalFilename()).replace(fileExtension, ""));
		if (fileName.contains("..")) {
			throw new IcipIaiException("Sorry! Filename contains invalid path sequence " + fileName);
		}
		Path target = java.nio.file.Files.createTempDirectory(targetLocation);
		Path targetFile = java.nio.file.Files.createTempFile(target, fileName, fileExtension);
		java.nio.file.Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
		return targetFile.toString();
	}

	/**
	 * Store binary file.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param file the file
	 * @return the string
	 * @throws SQLException the SQL exception
	 * @throws IOException  Signals that an I/O exception has occurred.
	 */
	public String storeBinaryFile(String name, String org, MultipartFile file) throws SQLException, IOException {
		logger.info("storing file in db");
		String fileName = file.getOriginalFilename();
		ICIPBinaryFiles binaryFiles = binaryService.findByNameAndOrg(name, org);
		SerialBlob blob = new SerialBlob(file.getBytes());
		if (binaryFiles == null) {
			binaryFiles = new ICIPBinaryFiles();
			binaryFiles.setCname(name);
			binaryFiles.setOrganization(org);
		}
		binaryFiles.setFilename(fileName);
		binaryFiles.setFilescript(blob);
		binaryFiles = binaryService.save(binaryFiles);
		return binaryFiles.getFilename();
	}

	/**
	 * Store native script file.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param file the file
	 * @return the string
	 * @throws SQLException the SQL exception
	 * @throws IOException  Signals that an I/O exception has occurred.
	 */
	public String storeNativeScriptFile(String name, String org, MultipartFile file) throws SQLException, IOException {
		logger.info("storing native script file in db");
		String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();
		String fileName = ICIPUtils.removeSpecialCharacter(name) + "_" + ICIPUtils.removeSpecialCharacter(org) + "."
				+ fileExtension;
		return persistInNativeScriptTable(file.getBytes(), name, fileName, org);
	}

	/**
	 * Store script file.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param file the file
	 * @return the string
	 * @throws SQLException the SQL exception
	 * @throws IOException  Signals that an I/O exception has occurred.
	 */
	public String storeScriptFile(String name, String org, MultipartFile file) throws SQLException, IOException {
		logger.info("storing script file in db");
		String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();
		String fileName = ICIPUtils.removeSpecialCharacter(name) + "_" + ICIPUtils.removeSpecialCharacter(org) + "."
				+ fileExtension;
		return persistInScriptTable(file.getBytes(), name, fileName, org);
	}

	/**
	 * Store drag and drop file.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param file the file
	 * @return the string
	 * @throws SQLException the SQL exception
	 * @throws IOException  Signals that an I/O exception has occurred.
	 */
	public String storeDragAndDropFile(String name, String org, MultipartFile file) throws SQLException, IOException {
		logger.info("storing draganddrop file in db");
		String fileExtension = Files.getFileExtension(file.getOriginalFilename()).toLowerCase().trim();
		String fileName = ICIPUtils.removeSpecialCharacter(name) + "_" + ICIPUtils.removeSpecialCharacter(org) + "."
				+ fileExtension;
		return persistInDragAndDropTable(file.getBytes(), name, fileName, org);
	}

	/**
	 * Persist in native script table.
	 *
	 * @param bytes    the bytes
	 * @param name     the name
	 * @param fileName the file name
	 * @param org      the org
	 * @return the string
	 * @throws SQLException the SQL exception
	 */
	public String persistInNativeScriptTable(byte[] bytes, String name, String fileName, String org)
			throws SQLException {
		ICIPNativeScript binaryFiles = nativeScriptService.findByNameAndOrg(name, org);
		SerialBlob blob = new SerialBlob(bytes);
		if (binaryFiles == null) {
			binaryFiles = new ICIPNativeScript();
			binaryFiles.setCname(name);
			binaryFiles.setOrganization(org);
		}
		binaryFiles.setFilescript(blob);
		binaryFiles.setFilename(fileName);
		
		
		//  binaryFiles = nativeScriptService.save(binaryFiles);
		return binaryFiles.getFilename();
	}

	/**
	 * Persist in script table.
	 *
	 * @param bytes    the bytes
	 * @param name     the name
	 * @param fileName the file name
	 * @param org      the org
	 * @return the string
	 * @throws SQLException the SQL exception
	 */
	public String persistInScriptTable(byte[] bytes, String name, String fileName, String org) throws SQLException {
		ICIPScript binaryFiles = scriptService.findByNameAndOrgAndFile(name, org, fileName);
		Blob blob = new SerialBlob(bytes);
		if (binaryFiles == null) {
			binaryFiles = new ICIPScript();
			binaryFiles.setCname(name);
			binaryFiles.setOrganization(org);
			binaryFiles.setFilename(fileName);
		}
		binaryFiles.setFilescript(blob);
		binaryFiles = scriptService.save(binaryFiles);
		return binaryFiles.getFilename();
	}

	/**
	 * Persist in drag and drop table.
	 *
	 * @param bytes    the bytes
	 * @param name     the name
	 * @param fileName the file name
	 * @param org      the org
	 * @return the string
	 * @throws SQLException the SQL exception
	 */
	public String persistInDragAndDropTable(byte[] bytes, String name, String fileName, String org)
			throws SQLException {
		ICIPDragAndDrop binaryFiles = dragAndDropService.findByNameAndOrgAndFile(name, org, fileName);
		Blob blob = new SerialBlob(bytes);
		if (binaryFiles == null) {
			binaryFiles = new ICIPDragAndDrop();
			binaryFiles.setCname(name);
			binaryFiles.setOrganization(org);
			binaryFiles.setFilename(fileName);
		}
		binaryFiles.setFilescript(blob);
		binaryFiles = dragAndDropService.save(binaryFiles);
		return binaryFiles.getFilename();
	}

	/**
	 * Persist in native script table.
	 *
	 * @param bytes       the bytes
	 * @param name        the name
	 * @param org         the org
	 * @param fileName    the file name
	 * @param newFileName the new file name
	 * @return the string
	 * @throws SQLException the SQL exception
	 * @throws IOException 
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	public String persistInNativeScriptTable(byte[] bytes, String name, String org, String fileName, String newFileName, String fileType)
			throws SQLException, InvalidRemoteException, TransportException, GitAPIException, IOException {
		ICIPNativeScript binaryFiles = nativeScriptService.findByNameAndOrg(name, org);
		
//		String remoteScript = constantsService.getByKeys("icip.script.github.enabled", org).getValue();
		String remoteScript = null;
		try {
			remoteScript = constantsService.getByKeys("icip.script.github.enabled", org).getValue();
		}catch(NullPointerException ex) {
			remoteScript = "false";
		}catch(Exception ex) {
			logger.error(ex.getMessage());
		}
		
		if(binaryFiles == null) {
			binaryFiles = new ICIPNativeScript();
		}
		Blob blob = new SerialBlob(bytes);
		if (binaryFiles.getCname() == null) {
			binaryFiles = new ICIPNativeScript();
			binaryFiles.setCname(name);
			binaryFiles.setOrganization(org);
		}
		binaryFiles.setFilename(newFileName);
		binaryFiles.setFilescript(blob);
		
		//Get github repository
		
		if(remoteScript.equals("true")) {
			logger.info("Git is enabled");
			Git git = githubservice.getGitHubRepository(org);
			
			//Pulling latest script from  Git
			Boolean result = githubservice.pull(git);
			
			//Updating script
			if(result!=false)
				githubservice.updateFileInLocalRepo(blob, name, org,"main.py");
			
			//Pushing script to Git
			githubservice.push(git,"Script pushed");
			
			ICIPStreamingServices ss = streamingServicesService.getICIPStreamingServices(name, org);
			  
			String jsonContent = "{\"elements\":[{\"attributes\":{\"filetype\":\""+fileType+"\",\"files\":[\""+name+"/main.py\"],\"arguments\":[{\"name\":\"type\",\"value\":\"pipeline\"}],\"dataset\":[]}}]}";
			
			
			ss.setJsonContent(jsonContent);
			
			streamingServicesService.update(ss);
		}
		else {
			binaryFiles = nativeScriptService.save(binaryFiles);
		}
		return binaryFiles.getFilename();
	}

	/**
	 * Persist in script table.
	 *
	 * @param bytes       the bytes
	 * @param name        the name
	 * @param org         the org
	 * @param fileName    the file name
	 * @param newFileName the new file name
	 * @return the string
	 * @throws SQLException the SQL exception
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 * @throws IOException 
	 */
	public String persistInScriptTable(byte[] bytes, String name, String org, String fileName, String newFileName)
			throws SQLException, InvalidRemoteException, TransportException, GitAPIException, IOException {
		ICIPScript binaryFiles = scriptService.findByNameAndOrgAndFile(name, org, fileName);
		Blob blob = new SerialBlob(bytes);
		if (binaryFiles == null) {
			binaryFiles = new ICIPScript();
			binaryFiles.setCname(name);
			binaryFiles.setOrganization(org);
		}
		binaryFiles.setFilename(newFileName);
		binaryFiles.setFilescript(blob);
		
		return binaryFiles.getFilename();
	}

	/**
	 * Persist in drag and drop table.
	 *
	 * @param bytes       the bytes
	 * @param name        the name
	 * @param org         the org
	 * @param fileName    the file name
	 * @param newFileName the new file name
	 * @return the string
	 * @throws SQLException the SQL exception
	 */
	public String persistInDragAndDropTable(byte[] bytes, String name, String org, String fileName, String newFileName)
			throws SQLException {
		ICIPDragAndDrop binaryFiles = dragAndDropService.findByNameAndOrgAndFile(name, org, fileName);
		SerialBlob blob = new SerialBlob(bytes);
		if (binaryFiles == null) {
			binaryFiles = new ICIPDragAndDrop();
			binaryFiles.setCname(name);
			binaryFiles.setOrganization(org);
		}
		binaryFiles.setFilename(newFileName);
		binaryFiles.setFilescript(blob);
		binaryFiles = dragAndDropService.save(binaryFiles);
		return binaryFiles.getFilename();
	}

	/**
	 * Store file.
	 *
	 * @param file   the file
	 * @param folder the folder
	 * @return the string
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public String storeFile(MultipartFile file, String folder) throws IOException {
		String fileName = file.getOriginalFilename();
		Path path = returnPath(folder, fileName);
		logger.info("uploading file at {} ", path.toAbsolutePath());
		java.nio.file.Files.createDirectories(path.getParent());
		java.nio.file.Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
		return path.toString();
	}

	/**
	 * Save file.
	 *
	 * @param file      the file
	 * @param metadata  the metadata
	 * @param cname     the cname
	 * @param org       the org
	 * @param agentType the agent type
	 * @return the path[]
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public Path[] saveFile(MultipartFile file, ICIPChunkMetaData metadata, String cname, String org, String agentType, int projectId)
			throws IOException {
		logger.info("saving file");
		java.nio.file.Path path = returnConfigPath(cname, org, agentType,
				ICIPUtils.removeSpecialCharacter(metadata.getFileGuid()),
				String.format("%d_%s", metadata.getIndex(), metadata.getFileName().trim().replace(" ", "")));
		java.nio.file.Files.createDirectories(path.getParent());
		java.nio.file.Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
		try (Stream<Path> stream = java.nio.file.Files.walk(path.getParent()).parallel()
				.filter(p -> !p.toFile().isDirectory() && p.getParent().equals(path.getParent()))) {
			long count = stream.count();
			if (count == metadata.getTotalCount()) {
				Path tmpPath = datasetFileService.mergeFiles(path, projectId, null);
				Path[] pathArray = new Path[2];
				pathArray[0] = tmpPath;
				pathArray[1] = tmpPath.getParent();
				return pathArray;
			}
		}
		return null;
	}

	/**
	 * Write native file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileName the file name
	 * @param fileType the file type
	 * @param scripts  the scripts
	 * @return the string
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	public String writeNativeFile(String cname, String org, String fileName, String fileType, MultipartFile scripts)
			throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException {
		String newFileName = createNewFileName(cname, org, fileType);
		//Path path = extractPath(scripts, newFileName, FileConstants.NATIVE_CODE);
		String filename = persistInNativeScriptTable(scripts.getBytes(), cname, org, fileName, newFileName, fileType);
		
		return filename;
//		if(filename!=null) {
//			
//		}
	}

	/**
	 * Write agents file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileType the file type
	 * @param scripts  the scripts
	 * @return the string
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public String writeAgentsFile(String cname, String org, String fileType, String[] scripts) throws IOException {
		String newFileName = createNewFileName(cname, org, fileType);
		Path path = extractPath(scripts, newFileName, FileConstants.AGENTS_CODE);
		JsonObject obj = new JsonObject();
		obj.addProperty("path", path.toAbsolutePath().toString());
		obj.addProperty("filename", newFileName);
		return obj.toString();
	}

	/**
	 * Write script file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileName the file name
	 * @param fileType the file type
	 * @param scripts  the scripts
	 * @return the string
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	public String writeScriptFile(String cname, String org, String fileName, String fileType, String[] scripts)
			throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException {
		String newFileName = createNewFileName(cname, org, fileType);
		Path path = extractPath(scripts, newFileName, FileConstants.SCRIPT_CODE);
		return persistInScriptTable(getFile(path), cname, org, fileName, newFileName);
	}

	/**
	 * Write drag and drop file.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileName the file name
	 * @param fileType the file type
	 * @param data     the data
	 * @return the string
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 */
	public String writeDragAndDropFile(String cname, String org, String fileName, String fileType, String data)
			throws IOException, SQLException {
		String newFileName = createNewFileName(cname, org, fileType);
		Path path = extractPathForDragAndDrop(data, org, newFileName, FileConstants.DRAGANDDROP_CODE);
		return persistInDragAndDropTable(path != null ? getFile(path) : new byte[0], cname, org, fileName, newFileName);
	}

	/**
	 * Extract path.
	 *
	 * @param scripts     the scripts
	 * @param newFileName the new file name
	 * @param folder      the folder
	 * @return the path
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private Path extractPath(String[] scripts, String newFileName, String folder) throws IOException {
		Path path = returnPath(folder, newFileName);
		StringBuilder sb = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		for (String script : scripts) {
			sb.append(script).append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
		}
		byte[] strToBytes = sb.toString().getBytes();
		java.nio.file.Files.createDirectories(path.getParent());
		java.nio.file.Files.write(path, strToBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING,
				StandardOpenOption.WRITE);
		return path;
	}

	/**
	 * Extract path for drag and drop.
	 *
	 * @param data        the data
	 * @param org         the org
	 * @param newFileName the new file name
	 * @param folder      the folder
	 * @return the path
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private Path extractPathForDragAndDrop(String data, String org, String newFileName, String folder)
			throws IOException {
		Path path = returnPath(folder, newFileName);
		data = "{\"input_string\":" + data + "}";
		data = pipelineService.populateDatasetDetails(data, org);
		data = pipelineService.populateSchemaDetails(data, org);
		if (data != null) {
			byte[] strToBytes = data.getBytes();
			java.nio.file.Files.createDirectories(path.getParent());
			java.nio.file.Files.write(path, strToBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING,
					StandardOpenOption.WRITE);
			return path;
		}
		return null;
	}

	/**
	 * Creates the new file name.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param fileType the file type
	 * @return the string
	 */
	private String createNewFileName(String cname, String org, String fileType) {
		String ext = null;
		switch (fileType.trim().toLowerCase()) {
		case "python2":
		case "python3":
		case IAIJobConstants.JYTHON_LANG:
			ext = "py";
			break;
		case "javascript":
			ext = "js";
			break;
		case "yaml":
		default:
			ext = "yaml";
			break;
		}
		return removeExtraCharAndCreateFileName(cname, org, ext);
	}

	/**
	 * Gets the file in server.
	 *
	 * @param in             the in
	 * @param filename       the filename
	 * @param fileTypeFolder the file type folder
	 * @return the file in server
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public Path getFileInServer(InputStream in, String filename, String fileTypeFolder) throws IOException {
		logger.info("getting file from db");
		Path path = returnPath(fileTypeFolder, filename);
		java.nio.file.Files.createDirectories(path.getParent());
		java.nio.file.Files.copy(in, path, StandardCopyOption.REPLACE_EXISTING);
		return path;
	}

	/**
	 * Return path.
	 *
	 * @param fileTypeFolder the file type folder
	 * @param filename       the filename
	 * @return the path
	 */
	public Path returnPath(String fileTypeFolder, String filename) {
		return Paths.get(folderPath, fileTypeFolder, filename);
	}

	/**
	 * Download binary file.
	 *
	 * @param cname          the cname
	 * @param org            the org
	 * @param filename       the filename
	 * @param fileTypeFolder the file type folder
	 * @return the byte[]
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 */
	public byte[] downloadBinaryFile(String cname, String org, String filename, String fileTypeFolder)
			throws IOException, SQLException {
		InputStream fi = null;
		try {
			fi=getBinaryInputStream(cname, org, filename);
			Path path = this.getFileInServer(fi, filename, fileTypeFolder);
			if (path != null) {
				return getFile(path);
			}
			throw new IOException(FileConstants.INVALID_PATH);
		}
		finally {
			if(fi != null)
			{
			try {
				 fi.close();
				 } catch (IOException e) {
					 logger.error(e.getMessage(), e);
				 }
			}
		}
		
	}

	/**
	 * Download log file.
	 *
	 * @param id             the id
	 * @param fileTypeFolder the file type folder
	 * @return the byte[]
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public byte[] downloadLogFile(String id, String fileTypeFolder) throws IOException {
		logger.info("getting file from server");
		Path path = returnPath(fileTypeFolder, id + ".log");
		if (path != null) {
			return getFile(path);
		}
		throw new IOException(FileConstants.INVALID_PATH);
	}

	/**
	 * Download native script file.
	 *
	 * @param cname          the cname
	 * @param org            the org
	 * @param filename       the filename
	 * @param fileTypeFolder the file type folder
	 * @return the byte[]
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	public byte[] downloadNativeScriptFile(String cname, String org, String filename, String fileTypeFolder)
			throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException {
		Path path;
		InputStream is = null;
		try {
		is = getNativeCodeInputStream(cname, org, filename);
		path= this.getFileInServer(is, filename, fileTypeFolder);
		if (path != null) {
			return getFile(path);
		}
		throw new IOException(FileConstants.INVALID_PATH);
		}
		finally {
			if(is != null)
			{
			try {
				 is.close();
				 } catch (IOException e) {
					 logger.error(e.getMessage(), e);
				 }
			}
		}
	}
	

	/**
	 * Download script file.
	 *
	 * @param cname          the cname
	 * @param org            the org
	 * @param filename       the filename
	 * @param fileTypeFolder the file type folder
	 * @return the byte[]
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 */
	public byte[] downloadScriptFile(String cname, String org, String filename, String fileTypeFolder)
			throws IOException, SQLException {
		Path path;
		InputStream is = null;
		try{
		is = getScriptCodeInputStream(cname, org, filename);
		path= this.getFileInServer(is, filename, fileTypeFolder);
		if (path != null) {
			return getFile(path);
		}
		throw new IOException(FileConstants.INVALID_PATH);
		}
		finally {
			if(is != null)
			{
			try {
				 is.close();
			     } catch (IOException e) {
			    	 logger.error(e.getMessage(), e);
			     }
		
			}
		}
	}

	/**
	 * Download drag and drop file.
	 *
	 * @param cname          the cname
	 * @param org            the org
	 * @param filename       the filename
	 * @param fileTypeFolder the file type folder
	 * @return the byte[]
	 * @throws IOException  Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 */
	public byte[] downloadDragAndDropFile(String cname, String org, String filename, String fileTypeFolder)
			throws IOException, SQLException {
		InputStream inputstream=null;
		try {
			inputstream = getDragAndDropCodeInputStream(cname, org, filename);
		Path path = this.getFileInServer(inputstream, filename, fileTypeFolder);
		if (path != null) {
			return getFile(path);
		}
		throw new IOException(FileConstants.INVALID_PATH);
		}
		finally {
			if(inputstream!=null) {
				safeClose(inputstream);
			}
		}
	}

	/**
	 * Gets the binary input stream.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the binary input stream
	 * @throws SQLException the SQL exception
	 */
	public InputStream getBinaryInputStream(String cname, String org, String filename) throws SQLException {
		ICIPBinaryFiles binaryFiles = binaryService.findByNameAndOrg(cname, org);
		if (binaryFiles != null && binaryFiles.getFilescript() != null) {
			return binaryFiles.getFilescript().getBinaryStream();
		}
		throw new SQLException(FileConstants.INVALID_FILE_NAME);
	}

	/**
	 * Gets the native code input stream.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the native code input stream
	 * @throws SQLException the SQL exception
	 * @throws IOException 
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	public InputStream getNativeCodeInputStream(String cname, String org, String filename) throws SQLException, IOException, InvalidRemoteException, TransportException, GitAPIException {
		String remoteScript = null;
		try {
			remoteScript = constantsService.getByKeys("icip.script.github.enabled", org).getValue();
		}catch(NullPointerException ex) {
			remoteScript = "false";
		}catch(Exception ex) {
			logger.error(ex.getMessage());
		}
		InputStream in=null;
		
		if((remoteScript.equalsIgnoreCase("true"))) {
			String scriptPath = githubservice.fetchFileFromLocalRepo(cname, org);
			if(scriptPath!=null) {
				in = new FileInputStream(scriptPath);
			}
			
			if(in!=null) {
				return in;
			}
			
		}
		if(!(remoteScript.equalsIgnoreCase("true")) || (in==null && remoteScript.equalsIgnoreCase("true"))) {
			logger.info("File not found in GitHub. Fetching from db...");
			ICIPNativeScript binaryFiles = nativeScriptService.findByNameAndOrg(cname, org);
			if (binaryFiles != null && binaryFiles.getFilescript() != null) {
				return binaryFiles.getFilescript().getBinaryStream();
			}
		}
		throw new SQLException(FileConstants.INVALID_FILE_NAME);
	}

	/**
	 * Gets the script code input stream.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the script code input stream
	 * @throws SQLException the SQL exception
	 */
	public InputStream getScriptCodeInputStream(String cname, String org, String filename) throws SQLException {
		ICIPScript binaryFiles = scriptService.findByNameAndOrgAndFile(cname, org, filename);
		if (binaryFiles != null && binaryFiles.getFilescript() != null) {
			return binaryFiles.getFilescript().getBinaryStream();
		}
		throw new SQLException(FileConstants.INVALID_FILE_NAME);
	}

	/**
	 * Gets the drag and drop code input stream.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the drag and drop code input stream
	 * @throws SQLException the SQL exception
	 */
	public InputStream getDragAndDropCodeInputStream(String cname, String org, String filename) throws SQLException {
		ICIPDragAndDrop binaryFiles = dragAndDropService.findByNameAndOrgAndFile(cname, org, filename);
		if (binaryFiles != null && binaryFiles.getFilescript() != null) {
			return binaryFiles.getFilescript().getBinaryStream();
		}
		throw new SQLException(FileConstants.INVALID_FILE_NAME);
	}

	/**
	 * Read config.
	 *
	 * @param agentType the agent type
	 * @param cname     the cname
	 * @param org       the org
	 * @return the string
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public String readConfig(String agentType, String cname, String org) throws IOException {
		JsonArray array = new JsonArray();
		Path path = returnConfigPath(cname, org, agentType, agentsConfig.getConfigFile(agentType));
		if (!java.nio.file.Files.exists(path)) {
			path = returnDefaultConfigPath(agentType.toLowerCase(), agentsConfig.getConfigFile(agentType));
		}
		List<String> readOnlyKeys = agentsConfig.getReadOnlyKeys(agentType);
		List<String> passwordKeys = agentsConfig.getPasswordKeys(agentType);
		StringBuilder strBuilder = ICIPUtils.readFileAsStringBuilder(path);
		String[] strs = strBuilder.toString().split(System.getProperty("line.separator"));
		for (int i = 0, j = strs.length; i < j; i++) {
			String[] kv = strs[i].split("=");
			if (strs[i].contains("=")) {
				String key = kv[0].trim();
				String value = kv.length > 1 ? kv[1].trim() : "";
				String type = "text";
				if (readOnlyKeys.contains(key)) {
					type = "readonly";
				}
				if (passwordKeys.contains(key)) {
					type = "password";
				}
				JsonObject json = new JsonObject();
				json.addProperty("name", key);
				json.addProperty("value", value);
				json.addProperty("type", type);
				array.add(json);
			}
		}
		return array.toString();
	}

	/**
	 * Write config.
	 *
	 * @param agentType the agent type
	 * @param cname     the cname
	 * @param org       the org
	 * @param config    the config
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public void writeConfig(String agentType, String cname, String org, String config) throws IOException {
		Gson gson = new Gson();
		JsonArray array = gson.fromJson(config, JsonArray.class);
		Map<String, String> map = new HashMap<>();
		array.forEach(element -> {
			JsonObject jsonObject = (JsonObject) element;
			map.put(jsonObject.get("name").getAsString().trim(), jsonObject.get("value").getAsString().trim());
		});
		Path newpath = returnConfigPath(cname, org, agentType, agentsConfig.getConfigFile(agentType));
		java.nio.file.Files.createDirectories(newpath.getParent());
		if (!java.nio.file.Files.exists(newpath)) {
			java.nio.file.Files.createFile(newpath);
		}
		Path path = returnDefaultConfigPath(agentType.toLowerCase(), agentsConfig.getConfigFile(agentType));
		StringBuilder strBuilder = ICIPUtils.readFileAsStringBuilder(path);
		StringBuilder newBuilder = new StringBuilder(IAIJobConstants.STRING_BUILDER_CAPACITY);
		String[] strs = strBuilder.toString().split(System.getProperty("line.separator"));
		for (int i = 0, j = strs.length; i < j; i++) {
			String[] kv = strs[i].split("=");
			if (strs[i].contains("=")) {
				String key = kv[0].trim();
				String value = map.containsKey(key) ? map.get(key) : "";
				newBuilder.append(key).append("=").append(value)
						.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
			} else {
				newBuilder.append(strs[i]).append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
			}
		}
		java.nio.file.Files.write(newpath, newBuilder.toString().getBytes(), StandardOpenOption.CREATE,
				StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.WRITE);
	}

	/**
	 * Read xml.
	 *
	 * @param agentType the agent type
	 * @param cname     the cname
	 * @param org       the org
	 * @return the json array
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public JsonArray readXml(String agentType, String cname, String org) throws IOException {
		Path path = returnConfigPath(cname, org, agentType, agentsConfig.getXmlFile(agentType));
		if (!java.nio.file.Files.exists(path)) {
			path = returnDefaultConfigPath(agentType.toLowerCase(), agentsConfig.getXmlFile(agentType));
		}
		JsonArray array = new JsonArray();
		Yaml yaml = new Yaml();
		Map<String, Object> map = yaml.load(java.nio.file.Files.newInputStream(path));
		Gson gson = new Gson();
		String newGsonString = gson.toJson(map, Map.class);
		JsonObject jsonObject = gson.fromJson(newGsonString, JsonObject.class);
		iterateArray(jsonObject, new Object[] { "", false, "init", "" }, array);
		return array;
	}

	/**
	 * Iterate array.
	 *
	 * @param element  the element
	 * @param primekey the primekey
	 * @param array    the array
	 */
	private void iterateArray(JsonElement element, Object[] primekey, JsonArray array) {
		if (element.isJsonArray()) {
			JsonArray jsonArray = element.getAsJsonArray();
			jsonArray.forEach(arrayElement -> {
				iterateArray(arrayElement, primekey, array);
			});
		} else {
			if (element.isJsonObject()) {
				JsonObject jsonObject = element.getAsJsonObject();
				jsonObject.keySet().forEach(key -> {
					if (!key.equals("value")) {
						if (key.equals("name")) {
							primekey[2] = jsonObject.get(key).getAsString();
							primekey[3] = jsonObject.get("value").getAsString();
							primekey[1] = false;
						} else {
							if (key.equals("Name")) {
								primekey[2] = jsonObject.get(key).getAsString();
								primekey[1] = true;
							}
						}
						iterateArray(jsonObject.get(key), primekey, array);
					}
				});
			} else {
				if ((boolean) primekey[1] && !((String) primekey[2]).isEmpty()) {
					JsonObject newJsonObject = new JsonObject();
					newJsonObject.add((String) primekey[2], new JsonArray());
					array.add(newJsonObject);
					primekey[0] = (String) primekey[2];
					primekey[2] = "";
				} else {
					if (!((String) primekey[2]).isEmpty()) {
						JsonObject newJsonObject = new JsonObject();
						newJsonObject.addProperty((String) primekey[2], (String) primekey[3]);
						array.get(array.size() - 1).getAsJsonObject().get((String) primekey[0]).getAsJsonArray()
								.add(newJsonObject);
					}
				}
			}
		}
	}

	/**
	 * Write xml.
	 *
	 * @param agentType the agent type
	 * @param cname     the cname
	 * @param org       the org
	 * @param config    the config
	 * @return the string
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public String writeXml(String agentType, String cname, String org, String config) throws IOException {
		Path path = returnDefaultConfigPath(agentType.toLowerCase(), agentsConfig.getXmlFile(agentType));
		Path newpath = returnConfigPath(cname, org, agentType, agentsConfig.getXmlFile(agentType));
		java.nio.file.Files.createDirectories(newpath.getParent());
		if (!java.nio.file.Files.exists(newpath)) {
			java.nio.file.Files.createFile(newpath);
		}
		List<String> lines = java.nio.file.Files.readAllLines(path);
		Gson gson = new Gson();
		JsonArray array = gson.fromJson(config, JsonArray.class);
		array.forEach(arrayElement -> {
			JsonObject tmpObj = arrayElement.getAsJsonObject();
			tmpObj.keySet().forEach(key -> {
				for (; new int[] { 0 }[0] < lines.size(); new int[] { 0 }[0] += 1) {
					String line = lines.get(new int[] { 0 }[0]);
					if (line.contains("Name") && line.contains(key)) {
						JsonArray tmpArray = tmpObj.get(key).getAsJsonArray();
						tmpArray.forEach(tmpArrayEle -> {
							JsonObject tmpArrayObj = tmpArrayEle.getAsJsonObject();
							tmpArrayObj.keySet().forEach(tmpkey -> {
								for (; new int[] { 0 }[0] < lines.size(); new int[] { 0 }[0] += 1) {
									String tmpline = lines.get(new int[] { 0 }[0]);
									if (tmpline.contains("name") && tmpline.contains(tmpkey)) {
										new int[] { 0 }[0] += 1;
										String str = lines.get(new int[] { 0 }[0]);
										lines.set(new int[] { 0 }[0], str.substring(0, str.indexOf("value")) + "value: "
												+ tmpArrayObj.get(tmpkey).getAsString());
										break;
									}
								}
							});
						});
						break;
					}
				}
			});
		});
		java.nio.file.Files.write(newpath, lines, Charset.defaultCharset());
		return newpath.toAbsolutePath().toString();
	}

	/**
	 * Download agents file.
	 *
	 * @param cname          the cname
	 * @param org            the org
	 * @param filename       the filename
	 * @param agentType      the agent type
	 * @param fileTypeFolder the file type folder
	 * @param pathArray      the path array
	 * @return the byte[]
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public byte[] downloadAgentsFile(String cname, String org, String filename, String agentType, String fileTypeFolder,
			JsonArray pathArray) throws IOException {
		Path tmppath = java.nio.file.Files.createTempDirectory("tmpZipFiles");
		String zipFileName = String.format("%s_%s_%s.zip", cname, org,
				ICIPUtils.removeSpecialCharacter(Instant.now().toString()));
		Path zipPath = Paths.get(tmppath.toAbsolutePath().toString(), zipFileName);
		List<Path> paths = new LinkedList<>();
		Path pypath = returnPath(fileTypeFolder, filename);
		Path configpath = returnConfigPath(cname, org, agentType, agentsConfig.getConfigFile(agentType));
		Path readmepath = returnDefaultConfigPath(agentType, agentsConfig.getReadmeFile(agentType));
		Path requirementpath = returnDefaultConfigPath(agentType, agentsConfig.getRequirementFile(agentType));
		Path eggpath = returnDefaultConfigPath(agentType, agentsConfig.getEggFile(agentType));
		paths.add(pypath);
		paths.add(configpath);
		paths.add(readmepath);
		paths.add(requirementpath);
		paths.add(eggpath);
		for (JsonElement element : pathArray) {
			paths.add(Paths.get(element.getAsString()));
		}
		FileOutputStream fos = new FileOutputStream(zipPath.toAbsolutePath().toString());
		try (fos) {
			ZipOutputStream zipOut = null;
			try {
				zipOut = new ZipOutputStream(fos);
				for (Path path : paths) {
					if (path != null && java.nio.file.Files.exists(path) && !java.nio.file.Files.isDirectory(path)) {
						File fileToZip = path.toFile();
						try (FileInputStream fis = new FileInputStream(fileToZip)) {
							ZipEntry zipEntry = new ZipEntry(fileToZip.getName());
							zipOut.putNextEntry(zipEntry);
							byte[] bytes = new byte[1024];
							int length;
							while ((length = fis.read(bytes)) >= 0) {
								zipOut.write(bytes, 0, length);
							}
						}
					}
				}
			}
			finally {
				if(zipOut != null) {
					try {
						zipOut.close();
					 } catch (IOException e) {
						 logger.error(e.getMessage(), e);
					 }
				}
			}
		}
		finally {
			if(fos != null) {
				try {
					fos.close();
				 } catch (IOException e) {
					 logger.error(e.getMessage(), e);
				 }
			}
		}
		return getFile(zipPath);
	}

	/**
	 * Return default config path.
	 *
	 * @param agentType the agent type
	 * @param filename  the filename
	 * @return the path
	 */
	public Path returnDefaultConfigPath(String agentType, String filename) {
		return Paths.get(agentPath, agentType, filename);
	}

	/**
	 * Return config path.
	 *
	 * @param cname     the cname
	 * @param org       the org
	 * @param agentType the agent type
	 * @param filename  the filename
	 * @return the path
	 */
	private Path returnConfigPath(String cname, String org, String agentType, String filename) {
		return Paths.get(agentPath, agentType.toLowerCase(), ICIPUtils.removeSpecialCharacter(org.toLowerCase()),
				ICIPUtils.removeSpecialCharacter(cname.toLowerCase()), filename);
	}

	/**
	 * Return config path.
	 *
	 * @param cname     the cname
	 * @param org       the org
	 * @param agentType the agent type
	 * @param filename1 the filename 1
	 * @param filename2 the filename 2
	 * @return the path
	 */
	private Path returnConfigPath(String cname, String org, String agentType, String filename1, String filename2) {
		return Paths.get(agentPath, agentType.toLowerCase(), ICIPUtils.removeSpecialCharacter(org.toLowerCase()),
				ICIPUtils.removeSpecialCharacter(cname.toLowerCase()), filename1, filename2);
	}

	/**
	 * Gets the file.
	 *
	 * @param path the path
	 * @return the file
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	private byte[] getFile(Path path) throws IOException {
		File file = path.toFile();
		byte[] bytesArray = new byte[(int) file.length()];
		int readLength = 0;
		try (FileInputStream fileInputStream = new FileInputStream(file)) {
			readLength = fileInputStream.read(bytesArray);
		}
		return readLength > 0 ? bytesArray : new byte[0];
	}

	/**
	 * Removes the extra char and create file name.
	 *
	 * @param name          the name
	 * @param org           the org
	 * @param fileExtension the file extension
	 * @return the string
	 */
	private String removeExtraCharAndCreateFileName(String name, String org, String fileExtension) {
		return String.format("%s%s%s%s%s", ICIPUtils.removeSpecialCharacter(name), "_",
				ICIPUtils.removeSpecialCharacter(org), ".", fileExtension);
	}
	
	public static void safeClose(InputStream fis) {
		 if (fis != null) {
			 try {
				 fis.close();
			 } catch (IOException e) {
				 logger.error(e.getMessage());
			 }
		 }
	}

}
