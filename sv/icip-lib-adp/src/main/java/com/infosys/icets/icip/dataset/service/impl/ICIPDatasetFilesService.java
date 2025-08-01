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

package com.infosys.icets.icip.dataset.service.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import javax.script.ScriptException;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.json.JSONException;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbColumn;
import com.healthmarketscience.sqlbuilder.dbspec.basic.DbTable;
import com.infosys.icets.ai.comm.lib.util.FileValidate;
import com.infosys.icets.ai.comm.lib.util.FileValidateV2;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.dto.FileValidateSummary;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExtensionKeyInvalidValue;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExtensionKeyNotFoundException;
import com.infosys.icets.icip.dataset.model.ICIPDatasetFiles;
import com.infosys.icets.icip.dataset.repository.ICIPDatasetFilesRepository;
import com.infosys.icets.icip.dataset.service.IICIPDatasetFilesService;
import com.infosys.icets.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.infosys.icets.icip.icipwebeditor.fileserver.service.impl.FileServerService;
import com.infosys.icets.icip.reader.xlsx.StreamingReader;
import com.jayway.jsonpath.JsonPath;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPDatasetFilesService.
 *
 * @author icets
 */
@Service
@RefreshScope
public class ICIPDatasetFilesService implements IICIPDatasetFilesService {

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDatasetFilesService.class);

	/** The datasetfilespath. */
	public static final String DATASETFILESPATH = "datasetfiles/";

	/** The icip upload dir. */
	@LeapProperty("icip.fileuploadDir")
	private String icipUploadDir;

	/** The dataset files repository. */
	@Autowired
	private ICIPDatasetFilesRepository datasetFilesRepository;

	/** The fileserver service. */
	@Autowired
	private FileServerService fileserverService;
	
	@Autowired
	private FileValidate fileValidate;

	@Autowired
	private FileValidateV2 fileValidateV2;

	/**
	 * Save.
	 *
	 * @param datasetFile the dataset file
	 * @return the ICIP dataset files
	 */
	@Override
	public ICIPDatasetFiles save(ICIPDatasetFiles datasetFile) {
		logger.info("Saving dataset file");
		return datasetFilesRepository.save(datasetFile);
	}

	/**
	 * Find by name and org.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP dataset files
	 */
	@Override
	public ICIPDatasetFiles findByNameAndOrgAndFilename(String name, String org, String filename) {
		logger.info("Getting Dataset File by Name : {} for {} and Org : {}", filename, name, org);
		return datasetFilesRepository.findByDatasetnameAndOrganizationAndFilename(name, org, filename);
	}

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP dataset files
	 */
	@Override
	public ICIPDatasetFiles findById(String id) {
		logger.info("Getting Dataset File by ID : {}", id);
		return datasetFilesRepository.findById(id);
	}

	/**
	 * Delete.
	 *
	 * @param icipDatasetFiles the icip dataset files
	 */
	@Override
	public void delete(ICIPDatasetFiles icipDatasetFiles) {
		datasetFilesRepository.delete(icipDatasetFiles);
	}

	/**
	 * Gets the headers.
	 *
	 * @param path the path
	 * @return the headers
	 * @throws IOException            Signals that an I/O exception has occurred.
	 * @throws CsvValidationException the csv validation exception
	 * @throws ScriptException 
	 * @throws JSONException 
	 */
	@Override
	public String getHeaders(Path path) throws IOException, CsvValidationException, JSONException, ScriptException {
		logger.info("Reading first line of file {}", path.getFileName());
		if (path.toString().endsWith("xlsx")) {
			try (FileInputStream is = new FileInputStream(path.toFile())) {
				try (Workbook workbook = StreamingReader.builder().rowCacheSize(100).bufferSize(4096).open(is)) {
					Sheet sheet = workbook.getSheetAt(0);
					Row row = sheet.iterator().next();
					List<String> collect = IntStream.range(0, row.getPhysicalNumberOfCells())
							.mapToObj(index -> String.format("(%s) %s", index, row.getCell(index).getStringCellValue()))
							.collect(Collectors.toList());
					return collect.toString();
				}
				catch (IOException e) {
					logger.error(e.getMessage());
				}
			}
		}
		if (path.toString().endsWith("csv")) {
			try (Reader reader = new FileReader(path.toFile())) {
				try (CSVReader csvReader = new CSVReader(reader)) {
					String[] line = csvReader.readNext();
					List<String> collect = IntStream.range(0, line.length)
							.mapToObj(index -> String.format("(%s) %s", index, line[index]))
							.collect(Collectors.toList());
					return collect.toString();
				}
			}
		}
		if(path.toString().endsWith("json")) {
			return ""; 
		}
		return null;
	}
	
	private List<Map<String, ?>> preprocessJson(String query, Object result) throws ScriptException {
		String jsonString = result.toString();
		List<Map<String, ?>> val1 = JsonPath.read(jsonString, query);
		return val1;

		
	}
	
	@Override
	public String getJsonHeaders(Path path, String query) throws FileNotFoundException, IOException, ScriptException {
		logger.info("Reading first line of file {}", path.getFileName());
		if(path.toString().endsWith("json")) {
			JSONParser jsonParser = new JSONParser();	        
	        try (FileReader reader = new FileReader(path.toFile())) {
	            Object object = jsonParser.parse(reader);
	            List<Map<String, ?>> obj = preprocessJson(query, object);

	            List<String> result = new ArrayList<>();
	            obj.forEach(ele->{
	            	Set<String> keys = ele.keySet();
	            	result.addAll(keys);
	            });
	            Set<String> headers = new HashSet<String>(result);       
	            return headers.toString().substring(1, headers.toString().length()-1);
	        } catch (ParseException e) {
	        	logger.error(e.getMessage());
	        	return "Format of file content not supported";
			}
		}
		return null;
		
	}

	/**
	 * Find by name and org.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP dataset files
	 */
	@Override
	public List<ICIPDatasetFiles> getFiles(String name, String org) {
		logger.info("Getting Dataset File by Name : {} and Org : {}", name, org);
		return datasetFilesRepository.findByDatasetnameAndOrganization(name, org);
	}
	
	@Override
	public List<ICIPDatasetFiles> getTemplateFiles(String org) {
		logger.info("Getting Template File by Org : {}", org);
		return datasetFilesRepository.findByOrganization(org);
	}

	/**
	 * Save file.
	 *
	 * @param file     the file
	 * @param metadata the metadata
	 * @param org the org
	 * @param fileid the fileid
	 * @return the path
	 * @throws Exception the exception
	 */
	@Override
	public HashMap<String, Object> saveFile(MultipartFile file, ICIPChunkMetaData metadata, String org, String fileid, int projectId, String type)
			throws Exception {
		logger.info("saving dataset file");
		HashMap<String, Object> map = new HashMap<>();		
//		List<String> allowedExtensions = new ArrayList<>();
//		FileValidateSummary fileValidateSummary = fileValidate.validateFile(file, allowedExtensions, 0, true);
//		if(fileValidateSummary!=null && !fileValidateSummary.isValid) {
//			map.put("ERROR:", "Uploaded file is invalid "+fileValidateSummary.reason);
//			return map;
//		}
//		if(file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
//			CSVReader csvReader = new CSVReader (new InputStreamReader (file.getInputStream ())); 
//			String[] nextLine;
//			while ((nextLine = csvReader.readNext()) != null) {
//				for (var e : nextLine) {
//					if(e.startsWith("=") || e.startsWith("+") || e.startsWith("-")
//	            		   || e.startsWith("@")) {
//						throw new LeapException("CSV file containing formula is not allowed");           	   
//					}
//				}
//			}
//		}
//		else if (file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
//			Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(file.getBytes()));
//			Sheet datatypeSheet = workbook.getSheetAt(0);
//			Iterator<Row> iterator = datatypeSheet.iterator();
//			while (iterator.hasNext()) {
//				Row currentRow = iterator.next();
//				Iterator<Cell> cellIterator = currentRow.iterator();
//				while (cellIterator.hasNext()) {
//					Cell currentCell = cellIterator.next();
//					switch(currentCell.getCellType().toString()) {
//					case "STRING":
//						if(currentCell.getStringCellValue().matches("(=|\\+|-|@).*")) {
//							throw new LeapException("Excel file containing formula is not allowed");
//						}
//						break;
//					case "NUMERIC":
//						if(String.valueOf(currentCell.getNumericCellValue()).matches("(=|\\+|-|@).*"))
//							throw new LeapException("Excel file containing formula is not allowed");
//						break;
//					case "FORMULA":
//						throw new LeapException("Excel file containing formula is not allowed");
//					default:
//						break;
//						
//					}
//				}
//			}
//
//		}

		Path path = getPath(metadata);
		Files.createDirectories(path.getParent());
		Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
		try (Stream<Path> stream = Files.walk(path.getParent()).parallel()
				.filter(p -> !p.toFile().isDirectory() && p.getParent().equals(path.getParent()))) {
			long count = stream.count();
			if (count == metadata.getTotalCount()) {
				Path mergedPath = mergeFiles(path, projectId, type);
				if(mergedPath!=null) {
					try {
						fileserverService.upload(mergedPath, fileid, metadata.getTotalCount(), true, org);
					} catch (Exception e) {
						logger.error("File upload failed",mergedPath);
					}
//					try (Stream<Path> stream1 = Files.walk(path.getParent()).parallel().filter(p -> !p.toFile().isDirectory()
//							&& p.getParent().equals(path.getParent()) && !p.getFileName().toString().startsWith("merged_"))
//							.sorted((path1, path2) -> {
//								int count1 = Integer.parseInt(path1.getFileName().toString().split("_", 2)[0]);
//								int count2 = Integer.parseInt(path2.getFileName().toString().split("_", 2)[0]);
//								return Integer.compare(count1, count2);
//							})) {
//						List<Path> paths = stream1.collect(Collectors.toList());
//						paths.forEach(chunkPath -> {
//							try {
//								fileserverService.upload(chunkPath, fileid, metadata.getTotalCount(), true, org);
//							} catch (Exception e) {
//								logger.error("Chunk upload failed",chunkPath);
//							}
//						});
//					}
				}					
				map.put("path", mergedPath);
				map.put("complete", true);
				return map;
			}
		}
		map.put("path", path);
		map.put("complete", false);
		return map;
	}
	
	/**
	 * Save file.
	 *
	 * @param file     the file
	 * @param metadata the metadata
	 * @param org the org
	 * @param fileid the fileid
	 * @return the path
	 * @throws Exception the exception
	 */
	@Override
	public HashMap<String, Object> saveFile(MultipartFile file, ICIPChunkMetaData metadata, String org, String fileid,int fileSize,String fileType, int projectId)
			throws Exception {
		logger.info("saving dataset file");
		HashMap<String, Object> map = new HashMap<>();		
//		List<String> allowedExtensions = new ArrayList<>();
//		FileValidateSummary fileValidateSummary = fileValidate.validateFile(file, allowedExtensions, 0, true);
//		if(fileValidateSummary!=null && !fileValidateSummary.isValid) {
//			map.put("ERROR:", "Uploaded file is invalid "+fileValidateSummary.reason);
//			return map;
//		}
//		if(file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
//			CSVReader csvReader = new CSVReader (new InputStreamReader (file.getInputStream ())); 
//			String[] nextLine;
//			while ((nextLine = csvReader.readNext()) != null) {
//				for (var e : nextLine) {
//					if(e.startsWith("=") || e.startsWith("+") || e.startsWith("-")
//	            		   || e.startsWith("@")) {
//						throw new LeapException("CSV file containing formula is not allowed");           	   
//					}
//				}
//			}
//		}
//		else if (file.getOriginalFilename().toLowerCase().endsWith(".xlsx")) {
//			Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(file.getBytes()));
//			Sheet datatypeSheet = workbook.getSheetAt(0);
//			Iterator<Row> iterator = datatypeSheet.iterator();
//			while (iterator.hasNext()) {
//				Row currentRow = iterator.next();
//				Iterator<Cell> cellIterator = currentRow.iterator();
//				while (cellIterator.hasNext()) {
//					Cell currentCell = cellIterator.next();
//					switch(currentCell.getCellType().toString()) {
//					case "STRING":
//						if(currentCell.getStringCellValue().matches("(=|\\+|-|@).*")) {
//							throw new LeapException("Excel file containing formula is not allowed");
//						}
//						break;
//					case "NUMERIC":
//						if(String.valueOf(currentCell.getNumericCellValue()).matches("(=|\\+|-|@).*"))
//							throw new LeapException("Excel file containing formula is not allowed");
//						break;
//					case "FORMULA":
//						throw new LeapException("Excel file containing formula is not allowed");
//					default:
//						break;
//						
//					}
//				}
//			}
//
//		}

		Path path = getPath(metadata);
		Files.createDirectories(path.getParent());
		Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
		fileserverService.upload(path, fileid, metadata.getTotalCount(), true, org);
		try (Stream<Path> stream = Files.walk(path.getParent()).parallel()
				.filter(p -> !p.toFile().isDirectory() && p.getParent().equals(path.getParent()))) {
			long count = stream.count();
			if (count == metadata.getTotalCount()) {
				Path mergedPath = mergeFiles(path, projectId, null);
				map.put("path", mergedPath);
				map.put("complete", true);
				return map;
			}
		}
		map.put("path", path);
		map.put("complete", false);

		return map;
	}

	/**
	 * Gets the path.
	 *
	 * @param metadata the metadata
	 * @return the path
	 */
	Path getPath(ICIPChunkMetaData metadata) {
		return Paths.get(icipUploadDir, DATASETFILESPATH, ICIPUtils.removeSpecialCharacter(metadata.getFileGuid()),
				metadata.getIndex() + "_" + metadata.getFileName().trim().replace(" ", ""));
	}

	/**
	 * Gets the path.
	 *
	 * @param id       the id
	 * @param index    the index
	 * @param filename the filename
	 * @return the path
	 */
	Path getPath(String id, int index, String filename) {
		return Paths.get(icipUploadDir, DATASETFILESPATH, id, index + "_" + filename);
	}

	/**
	 * Extract file name.
	 *
	 * @param filePath the file path
	 * @return the string
	 */
	String extractFileName(String filePath) {
		String rawFilename = filePath.substring(filePath.lastIndexOf("\\") + 1);
		return rawFilename.substring(rawFilename.indexOf("_") + 1);
	}

	/**
	 * Validate.
	 *
	 * @param row          the row
	 * @param requiredList the required list
	 * @param map          the map
	 * @param aTable       the a table
	 * @return the string
	 */
	public String validate(Row row, List<String> requiredList, Map<String, String> map, DbTable aTable) {
		String flag = "";
		for (Map.Entry<String, String> entry : map.entrySet()) {
			String col = entry.getKey();
			String idx = map.get(col);
			DbColumn column = aTable.findColumn(col);
			if (requiredList.contains(column.getColumnNameSQL()) && row.getCell(Integer.parseInt(idx)) != null
					&& (row.getCell(Integer.parseInt(idx)).getStringCellValue() == null
							|| row.getCell(Integer.parseInt(idx)).getStringCellValue().trim().isEmpty())) {
				flag = column.getColumnNameSQL();
			}

		}
		return flag;
	}

	/**
	 * Convert string to date.
	 *
	 * @param openDateStr the open date str
	 * @return the timestamp
	 * @throws IllegalArgumentException the illegal argument exception
	 */
	public DateTime convertStringToDate(String openDateStr) {
		String[] formatter = { "MM-dd-yyyy hh:mm:ss a", "MM-dd-yyyy hh:mm:ss", "dd-MM-yyyy hh:mm:ss",
				"MM/dd/yyyy hh:mm:ss", "MM/dd/yyyy", "yyyy-MM-dd hh:mm:ss", "MM-dd-yyyy HH:mm:ss a",
				"dd-MM-yyyy HH:mm:ss", "MM/dd/yyyy HH:mm:ss", "MM/dd/yyyy", "yyyy-MM-dd HH:mm:ss" };
		if (openDateStr != null && !openDateStr.isEmpty()) {
			DateTime parsedDate;
			for (int i = 0; i < formatter.length; i++) {
				try {
					DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern(formatter[i]);
					parsedDate = dateTimeFormatter.parseDateTime(openDateStr);
					return parsedDate;
				} catch (Exception ex) {
					logger.debug("Date Expection : {}", ex.getMessage(), ex);
				}
			}
		}
		return null;
	}

	/**
	 * Merge files.
	 *
	 * @param path the path
	 * @return the path
	 */
	public Path mergeFiles(Path path, int projectId, String type) {
		try {
			try (Stream<Path> stream = Files.walk(path.getParent()).parallel().filter(p -> !p.toFile().isDirectory()
					&& p.getParent().equals(path.getParent()) && !p.getFileName().toString().startsWith("merged_"))
					.sorted((path1, path2) -> {
						int count1 = Integer.parseInt(path1.getFileName().toString().split("_", 2)[0]);
						int count2 = Integer.parseInt(path2.getFileName().toString().split("_", 2)[0]);
						return Integer.compare(count1, count2);
					})) {
				String allowedExtensionKey = "FileUpload.AllowedExtension.CIP.UploadFile";
				List<Path> paths = stream.collect(Collectors.toList());
				Path mergedPath = path;
				mergedPath = Files.createDirectory(Paths.get(path.getParent().toString(), "merged"));
				File merged = new File(
						Paths.get(mergedPath.toString(), path.getFileName().toString().replaceFirst("^[0-9]*_", ""))
								.toString());
				if (!merged.createNewFile()) {
					throw new IOException(
							String.format("Merge file could not be created: %s", merged.getAbsolutePath()));
				}
				paths.forEach(chunkPath -> {
					File chunk = chunkPath.toFile();
					try (FileOutputStream fos = new FileOutputStream(merged, true)) {
						Files.copy(Paths.get(chunk.getAbsolutePath()), fos);
						fos.flush();
					} catch (IOException e) {
						logger.error("Error merging file: {}", e.getMessage());
					}
				});
				List<String> allowedExtensions = new ArrayList<String>();
				allowedExtensions.add("csv");
				allowedExtensions.add("xlsx");
				if(type.equalsIgnoreCase("docTemplate")) {
					allowedExtensions.remove("csv");
					allowedExtensions.remove("xlsx");
					allowedExtensions.add("docx");
					allowedExtensions.add("doc");
					allowedExtensionKey = "TemplateUpload.AllowedExtension.CIP.UploadTemplate";
				}
//				FileValidateSummary parsedOutput = fileValidate.validateFile(merged, allowedExtensions, 0, true);
				FileValidateSummary parsedOutput = null;
				try {
					parsedOutput = fileValidateV2.validateWithKey(merged, allowedExtensionKey, projectId, true);
				} catch (ExtensionKeyNotFoundException e) {
					logger.error(
						"Key " + allowedExtensionKey + " is not present in the project with ID " + projectId + " .");
				} catch (ExtensionKeyInvalidValue e) {
					logger.error(
						"Some Error Occured while Parsing the Json Value from key : "+allowedExtensionKey+" is not a valid Json ! ");
				}
				if (parsedOutput != null && !parsedOutput.isValid) {
					logger.info("Invalid File chunk.Please upload valid file");
					return null;
				}
//				try {
//					mergedPath = Files.copy(merged.toPath(), Paths.get(path.getParent().toString(), merged.getName()),
//							StandardCopyOption.REPLACE_EXISTING);
//				} catch (IOException e) {
//					logger.error("Error copying merged file: {}", e.getMessage());
//				}
				return merged.toPath();
			}
		} catch (IOException e) {
			logger.error("Error creating new file: {}", e.getMessage());
			return null;
		}
	}
	
	/**
	 * Copy file from server.
	 *
	 * @param datasetFile the dataset file
	 * @throws Exception the exception
	 */	
	public void copyFileFromServer(ICIPDatasetFiles datasetFile) throws Exception {
		Path filepath = Paths.get(datasetFile.getFilepath());
		if (!Files.exists(filepath) && datasetFile.getMetadata() != null
				&& !datasetFile.getMetadata().trim().isEmpty()) {
			try {
				Files.createDirectories(filepath.getParent());
				Files.createFile(filepath);
				Gson gson = new Gson();
				JsonObject metadataObj = gson.fromJson(datasetFile.getMetadata(), JsonObject.class);
//				for (int index = 0, limit = metadataObj.get("totalcount").getAsInt(); index < limit; index++) {
					byte[] bytes;
					bytes = fileserverService.download(datasetFile.getId(),
							metadataObj.get("filename").getAsString().trim().replace(" ", ""),
							datasetFile.getOrganization());
					Files.write(filepath, bytes, StandardOpenOption.APPEND);
//				}
			} catch (KeyManagementException | NoSuchAlgorithmException | KeyStoreException | IOException e) {
				logger.error(e.getMessage(), e);
			}
		}

	}

}
