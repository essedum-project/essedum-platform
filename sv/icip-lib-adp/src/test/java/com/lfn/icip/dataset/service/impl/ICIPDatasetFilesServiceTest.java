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

package com.lfn.icip.dataset.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.core.env.Environment;
import org.springframework.web.multipart.MultipartFile;

import com.lfn.icip.dataset.model.ICIPDatasetFiles;
import com.lfn.icip.dataset.repository.ICIPDatasetFilesRepository;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;

public class ICIPDatasetFilesServiceTest {

	@InjectMocks
	ICIPDatasetFilesService iCIPDatasetFilesService;

	@Mock
	ICIPDatasetFilesRepository datasetFilesRepository;

	@Mock
	Environment env;

	MultipartFile mfile;

	ICIPChunkMetaData metadata;

	ICIPDatasetFiles datasetFile;
	String name;
	String org;
	String id;
	String path;
	String file;
	int index;
	String folderPath;
	List<ICIPDatasetFiles> datasetFiles;
	int projectId;
	String type;

	@BeforeAll
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
		name = "test";
		org = "Acme";
		id = "1";
		path = "D:\\1-3-7-3\\loader.properties";
		file = "loader.properties";
		projectId = 1;
		datasetFile = new ICIPDatasetFiles();
		datasetFile.setFilepath(path);
		datasetFile.setId(id);
		datasetFile.setOrganization(org);

		datasetFiles = new ArrayList<ICIPDatasetFiles>();
		datasetFiles.add(datasetFile);
		index = 1;
		folderPath = "D:/essedum";
		Mockito.when(env.getProperty("icip.fileuploadDir")).thenReturn(folderPath);
		Mockito.when(datasetFilesRepository.save(datasetFile)).thenReturn(datasetFile);
		Mockito.when(datasetFilesRepository.findById(id)).thenReturn(datasetFile);

		metadata = new ICIPChunkMetaData();
		metadata.setFileGuid(id);
		metadata.setFileName(file);
		metadata.setIndex(index);

		mfile = new MultipartFile() {

			@Override
			public void transferTo(File dest) throws IOException, IllegalStateException {
				// TODO Auto-generated method stub

			}

			@Override
			public boolean isEmpty() {
				// TODO Auto-generated method stub
				return false;
			}

			@Override
			public long getSize() {
				// TODO Auto-generated method stub
				return 0;
			}

			@Override
			public String getOriginalFilename() {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public String getName() {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public InputStream getInputStream() throws IOException {
				String myString = "test";
				InputStream stream = new ByteArrayInputStream(Charset.forName("UTF-16").encode(myString).array());
				// TODO Auto-generated method stub
				return stream;
			}

			@Override
			public String getContentType() {
				// TODO Auto-generated method stub
				return null;
			}

			@Override
			public byte[] getBytes() throws IOException {
				// TODO Auto-generated method stub
				return null;
			}
		};
	}

	@Test
	void save() {
		assertEquals(iCIPDatasetFilesService.save(datasetFile), datasetFile);
	}

	@Test
	void findById() {
		assertEquals(iCIPDatasetFilesService.findById(id), datasetFile);
	}

	@Test
	void extractFileName() {
		assertEquals(iCIPDatasetFilesService.extractFileName(path), file);
	}


	@Test
	public void testGetPathDatasetChunkMetaData() throws Exception {

		iCIPDatasetFilesService.getPath(metadata);
	}

	@Test
	public void testGetPathStringIntString() throws Exception {
		iCIPDatasetFilesService.getPath(id, index, file);
	}

	@Test
	public void testGetHeaders() throws Exception {
		assertEquals(iCIPDatasetFilesService.getHeaders(Paths.get("")).trim().endsWith("t"), true);
	}

	@Test
	public void testGetFiles() throws Exception {
		Mockito.when(datasetFilesRepository.findByDatasetnameAndOrganization(name, org)).thenReturn(datasetFiles);
		assertEquals(iCIPDatasetFilesService.getFiles(name, org), datasetFiles);
	}

	@Test
	public void testSaveFile() throws Exception {
		assertEquals(iCIPDatasetFilesService.saveFile(mfile, metadata, file, file, projectId, type).toString(),
				"D:\\essedum\\datasetfiles\\1\\1_loader.properties");
	}


	/*
	 * @Test public void testReadChunkData() throws Exception {
	 * iCIPDatasetFilesService.readChunkData(datasetFile); }
	 */

}
