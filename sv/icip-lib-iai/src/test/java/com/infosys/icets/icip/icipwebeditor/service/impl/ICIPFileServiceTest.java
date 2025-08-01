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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.SQLException;

import org.apache.commons.io.IOUtils;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.env.Environment;
//import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.infosys.icets.icip.dataset.factory.IICIPDataSetServiceUtilFactory;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasetService;
import com.infosys.icets.icip.dataset.service.impl.ICIPDatasourceService;
import com.infosys.icets.icip.dataset.service.impl.ICIPSchemaRegistryService;
import com.infosys.icets.icip.icipwebeditor.constants.SetupResources;
import com.infosys.icets.icip.icipwebeditor.file.service.ICIPFileService;
import com.infosys.icets.icip.icipwebeditor.model.ICIPBinaryFiles;
import com.infosys.icets.icip.icipwebeditor.model.ICIPDragAndDrop;
import com.infosys.icets.icip.icipwebeditor.model.ICIPNativeScript;
import com.infosys.icets.icip.icipwebeditor.model.ICIPScript;

class ICIPFileServiceTest {

	private static ICIPFileService service;

	@Mock
	Environment env;

	private static ICIPBinaryFilesService binaryService;
	private static ICIPNativeScriptService nativeService;
	private static ICIPScriptService scriptService;
	private static ICIPDragAndDropService dndService;
	private static ICIPPipelineService pipelineService;
	private static ICIPStreamingServiceService streamingService;
	private static ICIPSchemaRegistryService schemaRegistryService;
	private static ICIPDatasetService datasetService;
	private static ICIPDatasourceService datasourceService;
	private static IICIPDataSetServiceUtilFactory datasetFactory;

	static String dir;
	static String targetLocation;
	static String fileName;
	static String fileExtension;
	static String org;
	static String mockDir;
	static String cname;
	String fileType;

	Path path;
	MultipartFile multipartFile;
	String currentFileName;
	byte[] bytes;

	@BeforeAll
	static void setUpBeforeAll() throws Exception {
		SetupResources.setup();
		nativeService = new ICIPNativeScriptService(SetupResources.nativeScriptRepository);
		binaryService = new ICIPBinaryFilesService(SetupResources.binaryRepository);
		streamingService = new ICIPStreamingServiceService(SetupResources.streamingServicesRepository, nativeService,
				binaryService,  null, null);
//		schemaRegistryService = new ICIPSchemaRegistryService(SetupResources.schemaRegistryRepository, null);
//		datasourceService = new ICIPDatasourceService(null, SetupResources.datasourceRepository, null, null, null);
//		datasetService = new ICIPDatasetService(SetupResources.datasetRepository, SetupResources.datasetRepository2,
//				datasourceService, schemaRegistryService, datasetFactory, null);
		pipelineService = new ICIPPipelineService(Mockito.mock(RestTemplateBuilder.class), null, null, null,
				datasourceService, null, null, binaryService, null, null, null);
		dndService = new ICIPDragAndDropService(SetupResources.dragAndDropRepository);
		scriptService = new ICIPScriptService(SetupResources.scriptRepository);
		service = new ICIPFileService(binaryService, nativeService, scriptService, dndService, pipelineService, null);
		dir = "icip.fileuploadDir";
		mockDir = "/home/admin/uploads";
		targetLocation = "python/";
		fileName = "test";
		fileExtension = "py";
		org = "Acme";
		cname = "TestFile";
	}

	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		Mockito.when(env.getProperty(dir)).thenReturn(mockDir);
		createNewFile(targetLocation);
	}

	private void createNewFile(String localLocation) throws Exception {
		String s = "/";
		String folderPath = env.getProperty(dir);
		if (folderPath.charAt(folderPath.length() - 1) == '/') {
			s = "";
		}
		String target = folderPath + s + localLocation;
		path = Paths.get(target + fileName + "." + fileExtension);
		Files.createDirectories(path.getParent());
		if (!Files.exists(path)) {
			Files.createFile(path);
		}
//		multipartFile = getMultipartFile(path.toFile());
	}

//	private MultipartFile getMultipartFile(File file) throws IOException {
//		FileInputStream input = new FileInputStream(file);
//		MultipartFile multipartFile = new MockMultipartFile(fileName, IOUtils.toByteArray(input));
//		return multipartFile;
//	}

	private void changeCurrentValues(MultipartFile file) throws IOException {
		currentFileName = cname + "_" + org + "." + fileExtension;
		bytes = file.getBytes();
	}

//	@Test
//	void testStoreTmpFile() throws Exception {
//		assertEquals(service.storeTmpFile(multipartFile, targetLocation), path.toString());
//	}

	@Test
	void testStoreBinaryFile() throws Exception {
		ICIPBinaryFiles binaryFile = new ICIPBinaryFiles();
		Mockito.when(binaryService.save(Mockito.any(ICIPBinaryFiles.class))).thenReturn(binaryFile);
		assertEquals(service.storeBinaryFile(cname, org, multipartFile), binaryFile.getFilename());
	}

	@Test
	void testStoreNativeScriptFile() throws Exception {
		ICIPNativeScript nativeFile = new ICIPNativeScript();
		Mockito.when(nativeService.save(Mockito.any(ICIPNativeScript.class))).thenReturn(nativeFile);
		assertEquals(service.storeNativeScriptFile(cname, org, multipartFile), nativeFile.getFilename());
	}

	@Test
	void testStoreScriptFile() throws Exception {
		ICIPScript scriptFile = new ICIPScript();
		Mockito.when(scriptService.save(Mockito.any(ICIPScript.class))).thenReturn(scriptFile);
		assertEquals(service.storeScriptFile(cname, org, multipartFile), scriptFile.getFilename());
	}

	@Test
	void testStoreDragAndDrop() throws Exception {
		ICIPDragAndDrop dndFile = new ICIPDragAndDrop();
		Mockito.when(dndService.save(Mockito.any(ICIPDragAndDrop.class))).thenReturn(dndFile);
		assertEquals(service.storeDragAndDropFile(cname, org, multipartFile), dndFile.getFilename());
	}

	@Test
	void testPersistInNativeScriptTable() throws Exception {
		changeCurrentValues(multipartFile);
		ICIPNativeScript nativeFile = new ICIPNativeScript();
		Mockito.when(nativeService.save(Mockito.any(ICIPNativeScript.class))).thenReturn(nativeFile);
		assertEquals(service.persistInNativeScriptTable(bytes, cname, currentFileName, org), nativeFile.getFilename());
	}

	@Test
	void testPersistInScriptTable() throws Exception {
		changeCurrentValues(multipartFile);
		ICIPScript scriptFile = new ICIPScript();
		Mockito.when(scriptService.save(Mockito.any(ICIPScript.class))).thenReturn(scriptFile);
		assertEquals(service.persistInScriptTable(bytes, cname, currentFileName, org), scriptFile.getFilename());
	}

	@Test
	void testPersistInDragAndDropTable() throws Exception {
		changeCurrentValues(multipartFile);
		ICIPDragAndDrop dndFile = new ICIPDragAndDrop();
		Mockito.when(dndService.save(Mockito.any(ICIPDragAndDrop.class))).thenReturn(dndFile);
		assertEquals(service.persistInDragAndDropTable(bytes, cname, currentFileName, org), dndFile.getFilename());
	}

	@Test
	void testPersistInNativeScriptTable2() throws Exception {
		changeCurrentValues(multipartFile);
		ICIPNativeScript nativeFile = new ICIPNativeScript();
		Mockito.when(nativeService.save(Mockito.any(ICIPNativeScript.class))).thenReturn(nativeFile);
		assertEquals(service.persistInNativeScriptTable(bytes, cname, org, fileName, currentFileName, fileType),
				nativeFile.getFilename());
	}

	@Test
	void testPersistInScriptTable2() throws Exception {
		changeCurrentValues(multipartFile);
		ICIPScript scriptFile = new ICIPScript();
		Mockito.when(scriptService.save(Mockito.any(ICIPScript.class))).thenReturn(scriptFile);
		assertEquals(service.persistInScriptTable(bytes, cname, org, fileName, currentFileName),
				scriptFile.getFilename());
	}

	@Test
	void testPersistInDragAndDropTable2() throws Exception {
		changeCurrentValues(multipartFile);
		ICIPDragAndDrop dndFile = new ICIPDragAndDrop();
		Mockito.when(dndService.save(Mockito.any(ICIPDragAndDrop.class))).thenReturn(dndFile);
		assertEquals(service.persistInDragAndDropTable(bytes, cname, org, fileName, currentFileName),
				dndFile.getFilename());
	}

	@Test
	void writeNativeFileTest() throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException {
		MultipartFile script = null;
		ICIPNativeScript nativeFile = new ICIPNativeScript();
		Mockito.when(nativeService.save(Mockito.any(ICIPNativeScript.class))).thenReturn(nativeFile);
		assertEquals(service.writeNativeFile(cname, org, currentFileName, fileExtension, script),
				nativeFile.getFilename());
	}

	@Test
	void writeScriptFileTest() throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException {
		String[] script = new String[0];
		ICIPScript scriptFile = new ICIPScript();
		Mockito.when(scriptService.save(Mockito.any(ICIPScript.class))).thenReturn(scriptFile);
		assertEquals(service.writeScriptFile(cname, org, currentFileName, fileExtension, script),
				scriptFile.getFilename());
	}

	@Test
	void writeDragAndDropFileTest() throws IOException, SQLException {
		ICIPDragAndDrop dndFile = new ICIPDragAndDrop();
		Mockito.when(dndService.save(Mockito.any(ICIPDragAndDrop.class))).thenReturn(dndFile);
		assertEquals(service.writeDragAndDropFile(cname, org, currentFileName, fileExtension, "\"abc\""),
				dndFile.getFilename());
	}

	@Test
	void getFileInServerTest() throws IOException {
		service.getFileInServer(Files.newInputStream(path), currentFileName, targetLocation);
	}

	@Test
	void downloadBinaryFileTest() throws IOException {
		ICIPBinaryFiles binaryFile = SetupResources.binary1;
		Mockito.when(binaryService.save(Mockito.any(ICIPBinaryFiles.class))).thenReturn(binaryFile);
		Exception exception = assertThrows(SQLException.class, () -> {
			service.downloadBinaryFile(binaryFile.getCname(), binaryFile.getOrganization(), binaryFile.getFilename(),
					targetLocation);
		});
		assertEquals(exception.getMessage(), SetupResources.INVALID_FILE_NAME);
	}

	@Test
	void downloadNativeScriptFileTest() throws IOException {
		ICIPNativeScript nativeFile = SetupResources.nativeScript1;
		Mockito.when(nativeService.save(Mockito.any(ICIPNativeScript.class))).thenReturn(nativeFile);
		Exception exception = assertThrows(SQLException.class, () -> {
			service.downloadNativeScriptFile(nativeFile.getCname(), nativeFile.getOrganization(),
					nativeFile.getFilename(), targetLocation);
		});
		assertEquals(exception.getMessage(), SetupResources.INVALID_FILE_NAME);
	}

	@Test
	void downloadScriptFileTest() throws IOException {
		ICIPScript scriptFile = SetupResources.script1;
		Mockito.when(scriptService.save(Mockito.any(ICIPScript.class))).thenReturn(scriptFile);
		Exception exception = assertThrows(SQLException.class, () -> {
			service.downloadNativeScriptFile(scriptFile.getCname(), scriptFile.getOrganization(),
					scriptFile.getFilename(), targetLocation);
		});
		assertEquals(exception.getMessage(), SetupResources.INVALID_FILE_NAME);
	}

	@Test
	void downloadDragAndDropFileTest() throws IOException {
		ICIPDragAndDrop dndFile = SetupResources.dragAndDrop1;
		Mockito.when(dndService.save(Mockito.any(ICIPDragAndDrop.class))).thenReturn(dndFile);
		Exception exception = assertThrows(SQLException.class, () -> {
			service.downloadNativeScriptFile(dndFile.getCname(), dndFile.getOrganization(), dndFile.getFilename(),
					targetLocation);
		});
		assertEquals(exception.getMessage(), SetupResources.INVALID_FILE_NAME);
	}

	@Test
	void getBinaryInputStreamTest() throws IOException {
		ICIPBinaryFiles binaryFile = SetupResources.binary1;
		Mockito.when(binaryService.save(Mockito.any(ICIPBinaryFiles.class))).thenReturn(binaryFile);
		Exception exception = assertThrows(SQLException.class, () -> {
			service.getBinaryInputStream(binaryFile.getCname(), binaryFile.getOrganization(), binaryFile.getFilename());
		});
		assertEquals(exception.getMessage(), SetupResources.INVALID_FILE_NAME);
	}

	@Test
	void getNativeCodeInputStreamTest() throws IOException {
		ICIPNativeScript nativeFile = SetupResources.nativeScript1;
		Mockito.when(nativeService.save(Mockito.any(ICIPNativeScript.class))).thenReturn(nativeFile);
		Exception exception = assertThrows(SQLException.class, () -> {
			service.getNativeCodeInputStream(nativeFile.getCname(), nativeFile.getOrganization(),
					nativeFile.getFilename());
		});
		assertEquals(exception.getMessage(), SetupResources.INVALID_FILE_NAME);
	}

	@Test
	void getScriptCodeInputStreamTest() throws IOException {
		ICIPScript scriptFile = SetupResources.script1;
		Mockito.when(scriptService.save(Mockito.any(ICIPScript.class))).thenReturn(scriptFile);
		Exception exception = assertThrows(SQLException.class, () -> {
			service.getScriptCodeInputStream(scriptFile.getCname(), scriptFile.getOrganization(),
					scriptFile.getFilename());
		});
		assertEquals(exception.getMessage(), SetupResources.INVALID_FILE_NAME);
	}

	@Test
	void getDragAndDropCodeInputStreamTest() throws IOException {
		ICIPDragAndDrop dndFile = SetupResources.dragAndDrop1;
		Mockito.when(dndService.save(Mockito.any(ICIPDragAndDrop.class))).thenReturn(dndFile);
		Exception exception = assertThrows(SQLException.class, () -> {
			service.getDragAndDropCodeInputStream(dndFile.getCname(), dndFile.getOrganization(), dndFile.getFilename());
		});
		assertEquals(exception.getMessage(), SetupResources.INVALID_FILE_NAME);
	}

	@Test
	void downloadLogFileTest() {
		assertThrows(IOException.class, () -> {
			service.downloadLogFile(fileName, targetLocation);
		});
	}

//	@Test
//	void testStoreFile() throws Exception {
//		createNewFile("store/");
//		assertEquals(service.storeFile(multipartFile, targetLocation), path.toString());
//	}

}
