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
package com.infosys.icets.icip.dataset.service.impl;

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

import com.infosys.icets.icip.dataset.model.ICIPDatasetFiles;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetFilesRepository;
import com.infosys.icets.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;

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
		folderPath = "D:/leap";
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
				"D:\\leap\\datasetfiles\\1\\1_loader.properties");
	}


	/*
	 * @Test public void testReadChunkData() throws Exception {
	 * iCIPDatasetFilesService.readChunkData(datasetFile); }
	 */

}
