package com.lfn.icip.icipwebeditor.fileserver.service.impl;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.io.FilenameUtils;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.lfn.ai.comm.lib.util.FileValidate;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.ai.comm.lib.util.dto.FileValidateSummary;
import com.lfn.ai.comm.lib.util.exceptions.EssedumException;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.fileserver.factory.FileServerFactory;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;

// TODO: Auto-generated Javadoc
/**
 * The Class FileServerService.
 */
@Service
@RefreshScope
public class FileServerService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(FileServerService.class);
	
	/** The factory. */
	private FileServerFactory factory;

	/** The active server. */
	@EssedumProperty("icip.fileserver.active.server")
	private String activeServer;
	
	/** The enabled. */
	@EssedumProperty("icip.fileserver.enabled")
	private String enabled;
	
	/** The folder path. */
	@EssedumProperty("icip.fileuploadDir")
	private String folderPath;
	
	@Autowired
	private FileValidate fileValidate;

	/**
	 * Instantiates a new file server service.
	 *
	 * @param factory the factory
	 */
	public FileServerService(FileServerFactory factory) {
		this.factory = factory;
	}

	/**
	 * Generate file ID.
	 *
	 * @param bucket the bucket
	 * @param prefix the prefix
	 * @return the string
	 * @throws Exception the exception
	 */
	public String generateFileID(String bucket, String prefix) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).generateFileID(bucket, prefix);
		} else {
			throw new EssedumException("Please enable fileserver to generate fileid");
		}
	}
	/**
	 * Upload.
	 *
	 * @param path the path
	 * @param fileid the fileid
	 * @param totalCount the total count
	 * @param replace the replace
	 * @param bucket the bucket
	 * @return the integer
	 * @throws Exception the exception
	 */
	public Integer upload(Path path, String fileid, int totalCount, boolean replace, String bucket, MultipartFile file) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).upload(path, null, fileid, totalCount, replace, bucket, file);
		} else {
			throw new EssedumException("Please enable fileserver to upload file");
		}
	}
	
	public Integer upload(Path path, String fileid, int totalCount, boolean replace, String bucket) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).upload(path, null, fileid, totalCount, replace, bucket);
		} else {
			throw new EssedumException("Please enable fileserver to upload file");
		}
	}

	/**
	 * Upload extra files.
	 *
	 * @param path the path
	 * @param folder the folder
	 * @param fileid the fileid
	 * @param totalCount the total count
	 * @param replace the replace
	 * @param bucket the bucket
	 * @return the integer
	 * @throws Exception the exception
	 */
	public Integer uploadExtraFiles(Path path, String folder, String fileid, int totalCount, boolean replace,
			String bucket) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).upload(path, folder, fileid, totalCount, replace, bucket);
		} else {
			throw new EssedumException("Please enable fileserver to upload file");
		}
	}

	/**
	 * Download.
	 *
	 * @param fileid the fileid
	 * @param index the index
	 * @param bucket the bucket
	 * @return the byte[]
	 * @throws Exception the exception
	 */
	public byte[] download(String fileid, String index, String bucket) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).download(fileid, index, bucket);
		} else {
			throw new EssedumException("Please enable fileserver to download file");
		}
	}

	
	public byte[] download(String fileid, String index, String bucket,String fileserverurl) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).download(fileid, index, bucket,fileserverurl);
		} else {
			throw new EssedumException("Please enable fileserver to download file");
		}
	}
	/**
	 * Delete.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the string
	 * @throws Exception the exception
	 */
	public String delete(String fileid, String bucket) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).delete(fileid, bucket);
		} else {
			throw new EssedumException("Please enable fileserver to delete file");
		}
	}

	/**
	 * Last call.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return true, if successful
	 * @throws Exception the exception
	 */
	public boolean lastCall(String fileid, String bucket) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).lastCall(fileid, bucket);
		} else {
			throw new EssedumException("Please enable fileserver to get last call");
		}
	}

	/**
	 * Gets the last index.
	 *
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the last index
	 * @throws Exception the exception
	 */
	public String getLastIndex(String fileid, String bucket, String datasource) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).getLastIndex(fileid, bucket, datasource);
		} else {
			throw new EssedumException("Please enable fileserver to get last index value");
		}
	}
	
	public String getLastIndex(String fileid, String bucket) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).getLastIndex(fileid, bucket);
		} else {
			throw new EssedumException("Please enable fileserver to get last index value");
		}
	}

	/**
	 * Gets the checksum.
	 *
	 * @param fileid the fileid
	 * @param index the index
	 * @param bucket the bucket
	 * @return the checksum
	 * @throws Exception the exception
	 */
	public String getChecksum(String fileid, String index, String bucket) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).getChecksum(fileid, index, bucket);
		} else {
			throw new EssedumException("Please enable fileserver to get checksum");
		}
	}

	/**
	 * Deploy.
	 *
	 * @param authserviceSession the authservice session
	 * @param url the url
	 * @param filename the filename
	 * @param inferenceClassFileName the inference class file name
	 * @param modelClassFileName the model class file name
	 * @param requirementsFileName the requirements file name
	 * @param fileid the fileid
	 * @param bucket the bucket
	 * @return the string
	 * @throws Exception the exception
	 */
	public String deploy(String authserviceSession, String url, String filename, String inferenceClassFileName,
			String modelClassFileName, String requirementsFileName, String fileid, String bucket) throws Exception {
		if (Boolean.parseBoolean(enabled)) {
			return factory.getServiceUtil(activeServer).deploy(authserviceSession, url, filename,
					inferenceClassFileName, modelClassFileName, requirementsFileName, fileid, bucket);
		} else {
			throw new EssedumException("Please enable fileserver to deploy");
		}
	}
	
	public Map<String,String> fileUploadHelper1(String fileid, String org, MultipartFile file,
			ICIPChunkMetaData chunkMetadata, String formulaCheck, List<String> allowedExtensions, Integer maxDepth, List<String> selectedRoles) throws JsonProcessingException, JsonMappingException, IOException,
			CsvValidationException, EssedumException, Exception {
		
		checkFileForEmbeddedContent(file, allowedExtensions, maxDepth);
		
		String chunkIndex = String.valueOf(chunkMetadata.getIndex());
		String fileName = chunkMetadata.getFileName();
		String s = "/";
		if (folderPath.charAt(folderPath.length() - 1) == '/') {
			s = "";
		}
		String filePath = String.format("%s%s%s/%s", folderPath, s, fileid, chunkIndex);
		Path path = Paths.get(filePath);
//		List<String> ds = new ArrayList<>();
		Map<String,String> metadata = new LinkedHashMap<String,String>();
		if(!formulaCheck.trim().toLowerCase().equals("false")){
			if (fileName.toLowerCase().endsWith(".csv")) {
				try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
					String[] nextLine;
					while ((nextLine = csvReader.readNext()) != null) {
						for (var e : nextLine) {
							if (e.startsWith("=") || e.startsWith("+") || e.startsWith("-") || e.startsWith("@")) {
								throw new EssedumException("CSV files containing formula are not allowed");
							}
						}
					}
				}
			} else if (fileName.toLowerCase().endsWith(".xlsx")) {
				try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(file.getBytes()))) {
					Sheet datatypeSheet = workbook.getSheetAt(0);
					Iterator<Row> iterator = datatypeSheet.iterator();
					while (iterator.hasNext()) {
						Row currentRow = iterator.next();
						Iterator<Cell> cellIterator = currentRow.iterator();
						while (cellIterator.hasNext()) {
							Cell currentCell = cellIterator.next();
							if (currentCell.getCellType().toString().equals("FORMULA")) {
								throw new EssedumException("Excel files containing formula are not allowed");
							}
						}
					}
				}
			}
		}
		/** Copy file to server path **/
		Files.createDirectories(path.getParent());
		Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
		/** Upload file to fileServer **/
		if (file.getSize() > 0) {
			int totalCount = chunkMetadata.getTotalCount();
			this.upload(path, fileid, totalCount, true, org, file);
			metadata.put("fileId", fileid);
			metadata.put("fileName", fileName);
			metadata.put("fileType", file.getContentType());
			metadata.put("fileSize", Long.toString(file.getSize()));
			metadata.put("selectedRoles",  String.join(",", selectedRoles));
			metadata.put("uploadedOn", DateTimeFormatter.ISO_INSTANT.format(Instant.now().truncatedTo(ChronoUnit.SECONDS)));
		}
		Files.deleteIfExists(path);
		Files.deleteIfExists(path.getParent());
		return metadata;
	}
	
	public Map<String,String> fileUploadHelper(String fileid, String org, MultipartFile file,
			ICIPChunkMetaData chunkMetadata, String formulaCheck, List<String> allowedExtensions, Integer maxDepth) throws JsonProcessingException, JsonMappingException, IOException,
			CsvValidationException, EssedumException, Exception {
		
		checkFileForEmbeddedContent(file, allowedExtensions, maxDepth);
		
		String chunkIndex = String.valueOf(chunkMetadata.getIndex());
		String fileName = chunkMetadata.getFileName();
		String s = "/";
		if (folderPath.charAt(folderPath.length() - 1) == '/') {
			s = "";
		}
		String filePath = String.format("%s%s%s/%s", folderPath, s, fileid, chunkIndex);
		Path path = Paths.get(filePath);
//		List<String> ds = new ArrayList<>();
		Map<String,String> metadata = new LinkedHashMap<String,String>();
		if(!formulaCheck.trim().toLowerCase().equals("false")){
			if (fileName.toLowerCase().endsWith(".csv")) {
				try (CSVReader csvReader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
					String[] nextLine;
					while ((nextLine = csvReader.readNext()) != null) {
						for (var e : nextLine) {
							if (e.startsWith("=") || e.startsWith("+") || e.startsWith("-") || e.startsWith("@")) {
								throw new EssedumException("CSV files containing formula are not allowed");
							}
						}
					}
				}
			} else if (fileName.toLowerCase().endsWith(".xlsx")) {
				try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(file.getBytes()))) {
					Sheet datatypeSheet = workbook.getSheetAt(0);
					Iterator<Row> iterator = datatypeSheet.iterator();
					while (iterator.hasNext()) {
						Row currentRow = iterator.next();
						Iterator<Cell> cellIterator = currentRow.iterator();
						while (cellIterator.hasNext()) {
							Cell currentCell = cellIterator.next();
							if (currentCell.getCellType().toString().equals("FORMULA")) {
								throw new EssedumException("Excel files containing formula are not allowed");
							}
						}
					}
				}
			}
		}
		/** Copy file to server path **/
		Files.createDirectories(path.getParent());
		Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
		/** Upload file to fileServer **/
		if (file.getSize() > 0) {
			int totalCount = chunkMetadata.getTotalCount();
			this.upload(path, fileid, totalCount, true, org, file);
			metadata.put("fileId", fileid);
			metadata.put("fileName", fileName);
			metadata.put("fileType", file.getContentType());
			metadata.put("fileSize", Long.toString(file.getSize()));
//			metadata.put("selectedRoles",  String.join(",", selectedRoles));
			metadata.put("uploadedOn", DateTimeFormatter.ISO_INSTANT.format(Instant.now().truncatedTo(ChronoUnit.SECONDS)));
		}
		Files.deleteIfExists(path);
		Files.deleteIfExists(path.getParent());
		return metadata;
	}
	
	public Map<String,String> generateReqsAndUpload1(String org, MultipartFile file, String prefix, int chunkingIndex, int chunkCount, String formulaCheck, List<String> allowedExtensions, Integer maxDepth, List<String> selectedRoles){
		try {
			String fileid = this.generateFileID(org, prefix);
			ICIPChunkMetaData chunkMetadata = new ICIPChunkMetaData(file.getOriginalFilename(), chunkingIndex, chunkCount, file.getSize(),
				FilenameUtils.getExtension(file.getOriginalFilename()), fileid, prefix);
			return this.fileUploadHelper1(fileid, org, file, chunkMetadata, formulaCheck, allowedExtensions, maxDepth, selectedRoles);
		} catch (Exception e) {
			Map<String,String> metadata = new LinkedHashMap<String,String>();
			metadata.put("Error:", e.getMessage());
			return metadata;
		}
		
	}
	
	public Map<String,String> generateReqsAndUpload(String org, MultipartFile file, String prefix, int chunkingIndex, int chunkCount, String formulaCheck, List<String> allowedExtensions, Integer maxDepth){
		try {
			String fileid = this.generateFileID(org, prefix);
			ICIPChunkMetaData chunkMetadata = new ICIPChunkMetaData(file.getOriginalFilename(), chunkingIndex, chunkCount, file.getSize(),
				FilenameUtils.getExtension(file.getOriginalFilename()), fileid, prefix);
			return this.fileUploadHelper(fileid, org, file, chunkMetadata, formulaCheck, allowedExtensions, maxDepth);
		} catch (Exception e) {
			Map<String,String> metadata = new LinkedHashMap<String,String>();
			metadata.put("Error:", e.getMessage());
			return metadata;
		}
		
	}
	public Map<String,String> fileUploadHelper(String fileid, String org, MultipartFile file,
			ICIPChunkMetaData chunkMetadata, String formulaCheck) throws JsonProcessingException, JsonMappingException, IOException,
			CsvValidationException, EssedumException, Exception {
		List<String> allowedExtensions = new ArrayList<>();
		return this.fileUploadHelper(fileid, org, file, chunkMetadata, formulaCheck, allowedExtensions, Integer.valueOf(0));
	}
	
	public Map<String,String> fileUploadHelper1(String fileid, String org, MultipartFile file,
			ICIPChunkMetaData chunkMetadata, String formulaCheck, List<String> selectedRoles) throws JsonProcessingException, JsonMappingException, IOException,
			CsvValidationException, EssedumException, Exception {
		List<String> allowedExtensions = new ArrayList<>();
		return this.fileUploadHelper1(fileid, org, file, chunkMetadata, formulaCheck, allowedExtensions, Integer.valueOf(0), selectedRoles);
	}
	
	public Map<String,String> generateReqsAndUpload1(String org, MultipartFile file, String prefix, int chunkingIndex, int chunkCount, String formulaCheck, List<String> selectedRoles){
		List<String> allowedExtensions = new ArrayList<>();
		return generateReqsAndUpload1(org, file, prefix, chunkingIndex, chunkCount, formulaCheck, allowedExtensions, Integer.valueOf(0), selectedRoles);
	}
	
	private void checkFileForEmbeddedContent(MultipartFile file, List<String> allowedExtensions, Integer maxDepth) throws EssedumException{
		FileValidateSummary fileValidateSummary = fileValidate.validateFile(file, allowedExtensions, maxDepth, true);
		if(fileValidateSummary!=null && !fileValidateSummary.isValid) {
			throw new EssedumException("Uploaded file is invalid "+fileValidateSummary.reason);
		}
	}
	
	public Map<String,String> archivalToFileserver(String fileid, String org, MultipartFile file,
			ICIPChunkMetaData chunkMetadata, String fileserverurl) throws JsonProcessingException, JsonMappingException, IOException,
			CsvValidationException, EssedumException, Exception {
			
		String chunkIndex = String.valueOf(chunkMetadata.getIndex());
		String fileName = chunkMetadata.getFileName();
		String s = "/";
		if (folderPath.charAt(folderPath.length() - 1) == '/') {
			s = "";
		}
		String filePath = String.format("%s%s%s/%s", folderPath, s, fileid, chunkIndex);
		Path path = Paths.get(filePath);
		Map<String,String> metadata = new LinkedHashMap<String,String>();

		/** Copy file to server path **/
		Files.createDirectories(path.getParent());
		Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
		/** Upload file to fileServer **/
		if (file.getSize() > 0) {
			int totalCount = chunkMetadata.getTotalCount();
		 factory.getServiceUtil(activeServer).upload(path, null, fileid, totalCount, true, org, fileserverurl);
			
		}
		Files.deleteIfExists(path);
		Files.deleteIfExists(path.getParent());
		return metadata;
	}

	public Map<String,String> uploadTemp(MultipartFile file) {
		Map<String,String> resUploadTemp=new HashMap<>();
		String  fileid= String.valueOf(System.currentTimeMillis());
		String chunkIndex = String.valueOf(file.getOriginalFilename());
		String s = "/";
		if (folderPath.charAt(folderPath.length() - 1) == '/') {
			s = "";
		}
		String filePath = String.format("%s%s%s/%s", folderPath, s, fileid, chunkIndex);
		Path path = Paths.get(filePath);
		resUploadTemp.put("uploadFilePath",filePath);
		resUploadTemp.put("object",file.getOriginalFilename()); 
		try {
			/* Copy file to server path */
			Files.createDirectories(path.getParent());
			Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			logger.error("Error because of:{} at class:{} and line:{}",e.getMessage(),e.getStackTrace()[0].getClass(),e.getStackTrace()[0].getLineNumber());
			if(logger.isDebugEnabled()){
				logger.error("Error due to:",e);
			}
		}
		return resUploadTemp;
	}
	

	public Map<String, String> uploadTempFileFromData(JSONObject fileData) {
		Map<String,String> resUploadTemp=new HashMap<>();
		String  fileid= String.valueOf(System.currentTimeMillis());
		String chunkIndex = String.valueOf(fileData.get("fileName"));
		String s = "/";
		if (folderPath.charAt(folderPath.length() - 1) == '/') {
			s = "";
		}
		String filePath = String.format("%s%s%s/%s", folderPath, s, fileid, chunkIndex);
		Path path = Paths.get(filePath);
		resUploadTemp.put("uploadFilePath",filePath);
		resUploadTemp.put("object",fileData.get("fileName").toString()); 
		try {
			/* Copy file to server path */
			InputStream is = new ByteArrayInputStream(fileData.getString("fileData").getBytes(StandardCharsets.UTF_8));

			Files.createDirectories(path.getParent());
			Files.copy(is, path, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			logger.error("Error because of:{} at class:{} and line:{}",e.getMessage(),e.getStackTrace()[0].getClass(),e.getStackTrace()[0].getLineNumber());
			if(logger.isDebugEnabled()){
				logger.error("Error due to:",e);
			}
		}
		return resUploadTemp;
	}
	
	public Map<String, String> deleteUploadedTemp(Map<String, String> fileDetails) {
		Map<String,String> resDeleteUploadedTemp=new HashMap<>();
		try {
			String uploadFile=fileDetails.get("uploadFilePath");
			Path path = Paths.get(uploadFile);
			Files.deleteIfExists(path);
			Files.deleteIfExists(path.getParent());
		} catch (Exception e) {
			resDeleteUploadedTemp.put("failed", "file not deleted or not found");
			logger.error("Error because of:{} at class:{} and line:{}",e.getMessage(),e.getStackTrace()[0].getClass(),e.getStackTrace()[0].getLineNumber());
			if(logger.isDebugEnabled()){
				logger.error("Error due to:",e);
			}
			return resDeleteUploadedTemp;
		}
		resDeleteUploadedTemp.put("success", "file deleted");
		return resDeleteUploadedTemp;
	}
	
	public Map<String, String> saveFileChunk(MultipartFile file, ICIPChunkMetaData metadata, String organization,
            String fileid) throws IOException {
        // TODO Auto-generated method stub
        Map<String, String> map = new HashMap<>();
        String chunkIndex = String.valueOf(file.getOriginalFilename());
        Path path = getPath(metadata);
        Files.createDirectories(path.getParent());
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        try (Stream<Path> stream = Files.walk(path.getParent()).parallel()
                .filter(p -> !p.toFile().isDirectory() && p.getParent().equals(path.getParent()))) {
            long count = stream.count();
            if (count == metadata.getTotalCount()) {
                Path mergedPath = mergeFiles(path);
                map.put("uploadFilePath", mergedPath.toString());
                map.put("object",file.getOriginalFilename());
                return map;
                }
           }
        map.put("path", path.toString());
        map.put("object",file.getOriginalFilename());
        return map;
    }
 
    private Path getPath(ICIPChunkMetaData metadata) {
        // TODO Auto-generated method stub
        return Paths.get(folderPath, ICIPUtils.removeSpecialCharacter(metadata.getFileGuid()),
                metadata.getIndex() + "_" + metadata.getFileName().trim().replace(" ", ""));
    }
 
    private Path mergeFiles(Path path) {
        // TODO Auto-generated method stub
        try {
            try (Stream<Path> stream = Files.walk(path.getParent()).parallel().filter(p -> !p.toFile().isDirectory()
                    && p.getParent().equals(path.getParent()) && !p.getFileName().toString().startsWith("merged_"))
                    .sorted((path1, path2) -> {
                        int count1 = Integer.parseInt(path1.getFileName().toString().split("_", 2)[0]);
                        int count2 = Integer.parseInt(path2.getFileName().toString().split("_", 2)[0]);
                        return Integer.compare(count1, count2);
                    })) {
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
                return merged.toPath();
            }
        } catch (IOException e) {
            logger.error("Error creating new file: {}", e.getMessage());
            return null;
        }
    }

}