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

package com.lfn.ai.comm.lib.util;

import java.io.File;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.tika.Tika;
import org.apache.tika.config.TikaConfig;
import org.apache.tika.detect.DefaultDetector;
import org.apache.tika.exception.TikaException;
import org.apache.tika.io.FilenameUtils;
import org.apache.tika.io.TikaInputStream;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.mime.MimeType;
import org.apache.tika.mime.MimeTypeException;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.parser.RecursiveParserWrapper;
import org.apache.tika.sax.BasicContentHandlerFactory;
import org.apache.tika.sax.ContentHandlerFactory;
import org.apache.tika.sax.RecursiveParserWrapperHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.SAXException;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;
import com.lfn.ai.comm.lib.util.dto.FileValidateSummary;
import com.lfn.ai.comm.lib.util.dto.UploadObject;
import com.lfn.ai.comm.lib.util.exceptions.ExtensionKeyInvalidValue;
import com.lfn.ai.comm.lib.util.exceptions.ExtensionKeyNotFoundException;

import com.lfn.ai.comm.lib.util.service.configkeys.support.ConfigurationKeysService;

import lombok.extern.slf4j.Slf4j;

/**
 * @author essedum
 *
 */

@Slf4j
@Service
public class FileValidateV2 {

	private final ConfigurationKeysService configurationKeysService;

	private static final String KEY_ALLOWED_FILE_EXTENSION = "allowedFileExtension";
	private static final String KEY_ALLOWED_FILE_TYPES = "allowedFileTypes";
	private static final String KEY_ALLOWED_DEPTH = "allowedDepth";
	private static final String KEY_ALLOWED_MANDATORY_FILE_EXTENSION = "allowedMandatoryFileExtension";
	private static final String FILE_PREFIX = "File ";
	private static final String CONTENT_TYPE = "Content-Type";
	private static final String EMBEDDED_DEPTH = "X-TIKA:embedded_depth";

	public FileValidateV2(ConfigurationKeysService configurationKeysService) {
		this.configurationKeysService = configurationKeysService;
	}

	private List<String> getListOfExtensionByKey(String key, JsonObject json){
		String value=json.has(key) ? json.get(key).getAsString() :"";
		if(!json.has(key)) log.info("Unable to find any Value with Key Name "+key+" inside the Json !");
		return Arrays.stream(value.split(",")).map(String::trim).toList();
	}
	private int getDepthByKey(String key,JsonObject json) {
		if(!json.has(key)) log.info("Unable to find any Value with Key Name "+key+" inside the Json !");
		return json.has(key) ? json.get(key).getAsInt() : 0;
	}
	private List<String> getListOfMandatoryExtensionByKey(String key, JsonObject json){
		String value=json.has(key) ? json.get(key).getAsString() :"";
		if(value.isEmpty())
			return Collections.<String>emptyList();
		
		if(!json.has(key))
			return Collections.<String>emptyList();

		return Arrays.stream(value.split(",")).map(String::trim).toList();
	}
	// Fetch variable form usm-constant -- application level
	// if condition
	
	private JsonObject getExtensionKeyValue(String allowedExtensionKey, int projectId)
			throws ExtensionKeyNotFoundException, ExtensionKeyInvalidValue {
		log.info("projectId {} and allowedExtension {}", projectId, allowedExtensionKey);
		// If ProjectId is - ve then choose core

		String key = projectId + " " + allowedExtensionKey;

		String value = configurationKeysService.getConfigKeyValue(key);
		if (value == null || value.equals("")) {
			log.info("value from dashConstantService for key = {} and projectId = {} is  {}, returning empty list",
					allowedExtensionKey, projectId, value);

			value = configurationKeysService.getConfigKeyValue(1 + " " + allowedExtensionKey);

			if (value == null || value.equals(""))
				throw new ExtensionKeyNotFoundException(
						"Key " + allowedExtensionKey + " is not present in the project with ID " + projectId + " .");

		}
		JsonObject json=new JsonObject();
		try {
			 json=new Gson().fromJson(value, JsonObject.class);
			 if(json==null || json.isJsonNull()) throw new ExtensionKeyInvalidValue("Invalid Json "+json+" Value from key : "+key+" , with value : "+ value);
		}
		catch(JsonSyntaxException ex) {
			log.error("Some Error Occured while Parsing the Json Value from key : "+key+" , with value : "+ value +" and error : "+ex.getMessage());
			throw new ExtensionKeyInvalidValue("Some Error Occured while Parsing the Json Value from key : "+key+" , with value : "+ value +" is not a valid Json ! ");
		}
		return json;

	}
	

	private JsonObject getJsonValueFromKey( String allowedExtensionKey,int projectId) throws ExtensionKeyNotFoundException, ExtensionKeyInvalidValue {
        JsonObject consideredAllowedExtension = null;
        if (allowedExtensionKey!=null && !allowedExtensionKey.isBlank())        
            consideredAllowedExtension = getExtensionKeyValue(allowedExtensionKey, projectId);
        else {
          
                consideredAllowedExtension = getExtensionKeyValue("FileUpload.AllowedExtension", projectId);
        }
        return consideredAllowedExtension;
    }

	
	public FileValidateSummary validateWithKey(File file, String allowedExtensionKey,
			int projectId,  Boolean extendedOutput)
			throws FileNotFoundException, ExtensionKeyNotFoundException, ExtensionKeyInvalidValue {
			 JsonObject json = getJsonValueFromKey(allowedExtensionKey, projectId);
			 List<String> consideredAllowedExtension =  getListOfExtensionByKey(KEY_ALLOWED_FILE_EXTENSION,json);
			 List<String> consideredAllowedFileTypes =  getListOfExtensionByKey(KEY_ALLOWED_FILE_TYPES,json);
			 Integer consideredAllowedDepth = getDepthByKey(KEY_ALLOWED_DEPTH,	 json);
			 List<String> consideredMandatoryExtension=getListOfMandatoryExtensionByKey(KEY_ALLOWED_MANDATORY_FILE_EXTENSION,json);

	        

		return this.validateFile(file, consideredAllowedExtension, consideredAllowedFileTypes, consideredAllowedDepth, extendedOutput,consideredMandatoryExtension);

	}

	public FileValidateSummary validateWithKey(MultipartFile mulipartFile,String allowedExtensionKey, int projectId,
	Boolean extendedOutput) throws ExtensionKeyNotFoundException, ExtensionKeyInvalidValue {
		 JsonObject json = getJsonValueFromKey(allowedExtensionKey, projectId);
		 List<String> consideredAllowedExtension =  getListOfExtensionByKey(KEY_ALLOWED_FILE_EXTENSION,json);
		 List<String> consideredAllowedFileTypes =  getListOfExtensionByKey(KEY_ALLOWED_FILE_TYPES,json);
		 Integer consideredAllowedDepth = getDepthByKey(KEY_ALLOWED_DEPTH,	 json);
		 List<String> consideredMandatoryExtension=getListOfMandatoryExtensionByKey(KEY_ALLOWED_MANDATORY_FILE_EXTENSION,json);


       return this.validateFile(mulipartFile,consideredAllowedExtension,consideredAllowedFileTypes,consideredAllowedDepth,extendedOutput,consideredMandatoryExtension);
}

	public FileValidateSummary validateWithKey(InputStream stream, String allowedExtensionKey, int projectId, 
			String fileName, Boolean extendedOutput) throws ExtensionKeyNotFoundException, ExtensionKeyInvalidValue {
		 JsonObject json = getJsonValueFromKey(allowedExtensionKey, projectId);
		 List<String> consideredAllowedExtension =  getListOfExtensionByKey(KEY_ALLOWED_FILE_EXTENSION,json);
		 List<String> consideredAllowedFileTypes =  getListOfExtensionByKey(KEY_ALLOWED_FILE_TYPES,json);
		 Integer consideredAllowedDepth = getDepthByKey(KEY_ALLOWED_DEPTH,	 json);
		 List<String> consideredMandatoryExtension=getListOfMandatoryExtensionByKey(KEY_ALLOWED_MANDATORY_FILE_EXTENSION,json);

	        
		return this.validateFile(stream, consideredAllowedExtension,consideredAllowedFileTypes, consideredAllowedDepth, fileName, extendedOutput,consideredMandatoryExtension);
	}

	// Manual finally + safeClose is intentional here: try-with-resources would either swallow the
	// FileNotFoundException that this method propagates, or lose the computed summary if close() throws.
	@SuppressWarnings("java:S2093")
	private FileValidateSummary validateFile(File file, List<String>allowed,List<String> allowedFileType, Integer allowedDepth,Boolean extendedOutput,List<String>allowedMandatoryFileExtension) throws FileNotFoundException {
		FileInputStream inputstream = null;
		FileValidateSummary summary;
		try {
			inputstream = new FileInputStream(file);

			summary = this.validateFile(inputstream, allowed, allowedFileType, allowedDepth, file.getName(),allowedMandatoryFileExtension);
			if (extendedOutput == null || !(extendedOutput))
				summary.parsedObjects = null;
		} finally {
			if (inputstream != null) {
				safeClose(inputstream);

			}
		}
		return summary;

	}

	// Extended mdouleName = No
	private FileValidateSummary validateFile(MultipartFile mulipartFile, List<String> allowed, List<String> allowedFileType,Integer allowedDepth,
			Boolean extendedOutput,List<String>allowedMandatoryFileExtension) {
		InputStream inputStream;
		FileValidateSummary summary = null;
		if (allowedDepth == null)
			allowedDepth = 0;
		try {
			inputStream = mulipartFile.getInputStream();
		} catch (IOException ex) {
			summary = new FileValidateSummary();
			summary.FileName = "";
			summary.isValid = false;
			summary.reason = "Error while parsing " + ex.getMessage();
			return summary;
		}
		summary = this.validateFile(inputStream, allowed, allowedFileType, allowedDepth, mulipartFile.getOriginalFilename(),allowedMandatoryFileExtension);
		if (extendedOutput == null || !(extendedOutput))
			summary.parsedObjects = null;

		return summary;
	}

	private FileValidateSummary validateFile(InputStream stream, List<String> allowedExtension,List<String> allowedFileType, Integer allowedDepth,
			String fileName, Boolean extendedOutput,List<String>allowedMandatoryFileExtension) {
		FileValidateSummary summary = this.validateFile(stream, allowedExtension, allowedFileType, allowedDepth, fileName,allowedMandatoryFileExtension);
		if (extendedOutput == null || !(extendedOutput))
			summary.parsedObjects = null;
		return summary;
	}

	private FileValidateSummary validateFile(InputStream stream, List<String> allowedExtension, List<String> allowedFileType,
			Integer allowedDepth, String fileName,List<String>allowedMandatoryFileExtension) {
		Set<String> setOfMandatoryExtension = new HashSet<>(allowedMandatoryFileExtension);
		FileValidateSummary r = new FileValidateSummary();
		r.FileName = "";
		r.isValid = true;

		if (allowedExtension.contains("*")) {
			r.reason = "Allowed extension configured to allow all(*). If not please change configuration.";
			return r;
		}
		log.info("\n\nFile name is " + fileName);
		try {
			List<UploadObject> uploadObjectList = this.getMetaRecursive(stream);
			if (uploadObjectList.isEmpty()) {
				r.reason = "Parsed file is of size 0.";
				return r;
			}
			int maxDepth = 0;
			r.parsedObjects = uploadObjectList;
			for (UploadObject obj : uploadObjectList) {
				log.info("Object is {}", obj);
				if (maxDepth < obj.depth)
					maxDepth = obj.depth;
				if (maxDepth > allowedDepth) {
					r.isValid = false;
					r.reason = "Embedded objects found at level " + maxDepth + " beyond allowed limit of "
							+ allowedDepth;
					break;
				}
				if (!obj.name.equals("embedded-0"))
					fileName = obj.name;
				if (validateUploadObject(obj, stream, fileName, allowedExtension, allowedFileType,
						setOfMandatoryExtension, r)) {
					return r;
				}
			}
			if (!setOfMandatoryExtension.isEmpty()) {
				r.FileName = fileName;
				r.isValid = false;
				r.reason = "Mandatory File Extension is not present " + setOfMandatoryExtension;
				return r;
			}
		} catch (Exception ex) {
			r.FileName = "";
			r.isValid = false;
			r.reason = "Error while parsing " + ex.getMessage();
		}
		return r;
	}

	/**
	 * Validates a single parsed object against the allowed extensions and file types.
	 *
	 * @return {@code true} if validation failed (the failure reason is recorded in {@code r} and the
	 *         caller should return it); {@code false} if the object is acceptable and the loop should
	 *         continue with the next object.
	 */
	private boolean validateUploadObject(UploadObject obj, InputStream stream, String fileName,
			List<String> allowedExtension, List<String> allowedFileType, Set<String> setOfMandatoryExtension,
			FileValidateSummary r) throws IOException, MimeTypeException {
		String extensionForFileName = this.getMediaTypeForFileName(fileName);
		String extensionForContent = getExtensionForFileContent(stream, fileName);
		log.info("recievedExtension is {}", extensionForContent);
		extensionForContent = extensionForContent.replaceFirst("\\.", "");

		// if bin means tika unable to detect file extension
		if (extensionForContent.equals("bin")) {
			// Manually find the extension from the file name when Tika cannot detect it.
			String fileExtension = extractFileExtension(fileName);
			if (fileExtension.isBlank()) {
				r.FileName = fileName;
				r.isValid = false;
				r.reason = FILE_PREFIX + fileName
						+ " does not have any extension. Please Re-Upload the File with correct Extension and contact administrator get the allowed extension details.";
				return true;
			}
			extensionForContent = fileExtension;
		}
		if (setOfMandatoryExtension.contains(extensionForContent.trim())) {
			setOfMandatoryExtension.remove(extensionForContent.trim());
		}
		if (!allowedExtension.contains(extensionForContent.trim())) {
			log.info("Detected uploaded uploadedFileExtension is {} and allowedExtension is {}", extensionForContent,
					allowedExtension);
			r.FileName = fileName;
			r.isValid = false;
			r.reason = FILE_PREFIX + fileName + " has extension " + extensionForContent
					+ " which is not allowed. Please contact administrator to configure the allowed extensions.";
			return true;
		}

		// Need to extract only first part from obj.contentType because it contains other info apart from contentType.
		// For E.g in case of CSV file : text/csv; charset=UTF-8; delimiter=comma -> only first part is the mimeType.
		obj.contentType = obj.contentType.split(";")[0].trim();
		log.info("Detected uploaded obj Media type is {} and extension is {}", obj.contentType, extensionForFileName);
		log.info("allowedExtension is {}", allowedExtension);
		String fileNameBasedMimeType = getMediaTypeForFileName(fileName);
		log.info("Detected Media type fileNameBasedMimeType is {}", fileNameBasedMimeType);
		log.info("Media type based on the Content {}", obj.contentType);

		// This check was added because a python file's content type was text/plain but the extension was text/x-python.
		// For every file with content type text/plain, check if the extension is present in the allowedExtension list.
		if (obj.contentType.contains("text/plain")) {
			log.info("File type contains mimeType based on the content {} now checking in the allowed Extensions {} ",
					obj.contentType, allowedExtension);
			if (allowedExtension.contains(extensionForContent.trim())) {
				return false;
			}
			r.FileName = fileName;
			r.isValid = false;
			r.reason = FILE_PREFIX + fileName + " has extension " + extensionForContent
					+ "  which is not allowed. Please contact administrator to configure the allowed extensions.";
			return true;
		}

		String mimeType = obj.contentType;
		if (mimeType == null) {
			log.info("Unable to Detect the uploaded File mimeType");
			r.FileName = fileName;
			r.isValid = false;
			r.reason = FILE_PREFIX + fileName + " has content Based mimeType " + obj.contentType
					+ "  which is not allowed. Please re upload the correct file.";
			return true;
		}

		String mimeTypeBasedOnExtension = getMediaTypeForFileContent(stream, fileName);
		log.info("Detected Mime type based on extension is  {}", mimeTypeBasedOnExtension);
		if (!mimeType.equals(mimeTypeBasedOnExtension)) {
			// If the content-based mimeType is explicitly allowed by the admin, accept it; otherwise reject.
			log.info("Some Mismatch occured Mime Type: {} and Mime Type Based on Extension: {} is not matching.",
					mimeType, mimeTypeBasedOnExtension);
			if (allowedFileType.contains(mimeType.trim())) {
				log.info("Mime Type: {} and Allowed FileTypes by admin are : {} is matching.", mimeType,
						allowedFileType);
				return false;
			}
			log.error("FileMismatchError: Mime Type: {} and Mime Type Based on Extension: {} is not matching.", mimeType,
					mimeTypeBasedOnExtension);
			r.FileName = fileName;
			r.isValid = false;
			r.reason = FILE_PREFIX + fileName + " has mimeType " + mimeType + " and mimeType baed on file extension  "
					+ mimeTypeBasedOnExtension + " is not matching. Please re check the file and it's extension.";
			return true;
		}
		return false;
	}

	private String extractFileExtension(String fileName) {
		int i = fileName.lastIndexOf('.');
		int p = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'));
		if (i > p) {
			return fileName.substring(i + 1);
		}
		return "";
	}

	private List<UploadObject> getMetaRecursive(InputStream stream) throws IOException, TikaException, SAXException {
		Parser p = new AutoDetectParser();
		ContentHandlerFactory factory = new BasicContentHandlerFactory(BasicContentHandlerFactory.HANDLER_TYPE.HTML,
				-1);
		RecursiveParserWrapper wrapper = new RecursiveParserWrapper(p);
		Metadata metadata = new Metadata();
		ParseContext context = new ParseContext();

		RecursiveParserWrapperHandler handler = new RecursiveParserWrapperHandler(factory);
		wrapper.parse(stream, handler, metadata, context);

		List<Metadata> listOfMetadata = handler.getMetadataList();

		List<UploadObject> uploadObjectList = new ArrayList<>();

		for (Metadata metaData : listOfMetadata) {
			 log.info("Meta is " + metaData);

			if (metaData.get(CONTENT_TYPE) != null && metaData.get(CONTENT_TYPE).equals("image/emf"))
				continue;

			UploadObject obj = new UploadObject();
			
			obj.contentType = metaData.get(CONTENT_TYPE);

			obj.name = getResourceName(metaData);
			if (metaData.get("extended-properties:Application") != null)
				obj.normalType = metaData.get("extended-properties:Application");

			if (metaData.get("File Size") != null)
				obj.size = metaData.get("File Size");

			if (metaData.get(EMBEDDED_DEPTH) != null)
				obj.depth = Integer.parseInt(metaData.get(EMBEDDED_DEPTH));
			if (metaData.get("X-TIKA:embedded_resource_path") != null)
				obj.depthPath = metaData.get("X-TIKA:embedded_resource_path");

			uploadObjectList.add(obj);
		}

		return uploadObjectList;
	}

	private String getResourceName(Metadata metadata) {
		String objectName = "";
		if (metadata.get(TikaCoreProperties.RESOURCE_NAME_KEY) != null) {
			objectName = metadata.get(TikaCoreProperties.RESOURCE_NAME_KEY);
		} else if (metadata.get(TikaCoreProperties.EMBEDDED_RELATIONSHIP_ID) != null) {
			objectName = metadata.get(TikaCoreProperties.EMBEDDED_RELATIONSHIP_ID);
		} else {
			if (metadata.get(EMBEDDED_DEPTH) != null)
				objectName = "embedded-" + metadata.get(EMBEDDED_DEPTH);

		}

		log.info("objectName is " + objectName);

		objectName = FilenameUtils.getName(objectName);
		return objectName;
	}

	private String getMediaTypeForFileName(String fileName) {
		Tika tika = new Tika();
		return tika.detect(fileName);
	}

	private String getMediaTypeForFileContent(InputStream stream, String fileName) throws IOException {
		DefaultDetector fileDetector = new DefaultDetector();
		TikaInputStream fileStream = TikaInputStream.get(stream);
		Metadata metadata = new Metadata();
		metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, fileName);
		org.apache.tika.mime.MediaType mediaType = fileDetector.detect(fileStream, metadata);
		return mediaType.toString();
	}
	
	private String getExtensionForFileContent(InputStream stream, String fileName) throws IOException,MimeTypeException {
		DefaultDetector fileDetector = new DefaultDetector();
		TikaInputStream fileStream = TikaInputStream.get(stream);
		Metadata metadata = new Metadata();
		metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, fileName);
		org.apache.tika.mime.MediaType mediaType = fileDetector.detect(fileStream, metadata);
		TikaConfig config = TikaConfig.getDefaultConfig();
		MimeType mimeType = config.getMimeRepository().forName(mediaType.toString());
		return mimeType.getExtension();
	}
	
	private static void safeClose(FileInputStream fis) {
		if (fis != null) {
			try {
				fis.close();
			} catch (IOException e) {
				log.error(e.getMessage());
			}
		}
	}

}
