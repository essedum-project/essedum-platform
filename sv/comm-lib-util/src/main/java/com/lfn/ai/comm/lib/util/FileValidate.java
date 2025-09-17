/**
 * The MIT License (MIT)
 * Copyright © 2025 Essedum
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

import java.io.BufferedInputStream;
import java.io.File;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.tika.Tika;
import org.apache.tika.detect.DefaultDetector;
import org.apache.tika.exception.TikaException;
import org.apache.tika.io.FilenameUtils;
import org.apache.tika.io.TikaInputStream;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.mime.MediaType;
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

import com.lfn.ai.comm.lib.util.dto.FileValidateSummary;
import com.lfn.ai.comm.lib.util.dto.UploadObject;

import lombok.extern.slf4j.Slf4j;

/**
 * @author essedum
 *
 */

@Slf4j
@Service
@Deprecated(since = "2.0.1", forRemoval = true)
public class FileValidate {

	// Fetch variable form usm-constant -- application level
	// if condition

	@Deprecated(since = "2.0.1", forRemoval = true)
	public FileValidateSummary validateFile(File file, List<String> allowed, Integer allowedDepth,
			Boolean extendedOutput) throws FileNotFoundException {
		FileInputStream inputstream=null;
		FileValidateSummary summary;
		try {
		inputstream = new FileInputStream(file);

		summary = this.validateFile(inputstream, allowed, allowedDepth, file.getName());
		if (extendedOutput == null || !(extendedOutput))
			summary.parsedObjects = null;
		}
		finally {
			if(inputstream!=null) {
				safeClose(inputstream);

			}
		}
		return summary;

	}

	@Deprecated(since = "2.0.1", forRemoval = true)
	public FileValidateSummary validateFile(File file, List<String> allowed) throws FileNotFoundException {
		FileInputStream inputstream=null;
		try {
		inputstream = new FileInputStream(file);
		}
		finally {
			if(inputstream!=null) {
				safeClose(inputstream);
			}
		}
		return this.validateFile(inputstream, allowed, 0, file.getName());
	}

	@Deprecated(since = "2.0.1", forRemoval = true)
	public FileValidateSummary validateFile(MultipartFile mulipartFile, List<String> allowed) {
		return this.validateFile(mulipartFile, allowed, 0, false);
	}

	// Extended mdouleName = No
	@Deprecated(since = "2.0.1", forRemoval = true)
	public FileValidateSummary validateFile(MultipartFile mulipartFile, List<String> allowed, Integer allowedDepth,
			Boolean extendedOutput) {
		InputStream inputStream;
		BufferedInputStream bufferedInputStream;
		FileValidateSummary summary = null;
		if (allowedDepth == null)
			allowedDepth = 0;
		try {
			inputStream = mulipartFile.getInputStream();
//			bufferedInputStream=new BufferedInputStream(inputStream);
		} catch (IOException ex) {
			summary = new FileValidateSummary();
			summary.FileName = "";
			summary.isValid = false;
			summary.reason = "Error while parsing " + ex.getMessage();
			return summary;
		}
		summary = this.validateFile(inputStream, allowed, allowedDepth, mulipartFile.getOriginalFilename());
		if (extendedOutput == null || !(extendedOutput))
			summary.parsedObjects = null;

		return summary;
	}

	@Deprecated(since = "2.0.1", forRemoval = true)
	public FileValidateSummary validateFile(InputStream stream, List<String> allowedExtension, Integer allowedDepth,
			String fileName, Boolean extendedOutput) {
		FileValidateSummary summary = this.validateFile(stream, allowedExtension, allowedDepth, fileName);
		if (extendedOutput == null || !(extendedOutput))
			summary.parsedObjects = null;
		return summary;
	}

	private FileValidateSummary validateFile(InputStream stream, List<String> allowedExtension, Integer allowedDepth,
			String fileName) {

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
			if (uploadObjectList.size() == 0) {
				r.reason = "Parsed file is of size 0.";
				return r;
			}
			int maxDepth = 0;
			r.parsedObjects = uploadObjectList;
			StringBuffer reason1 = new StringBuffer();
			StringBuffer reason2 = new StringBuffer();
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

				String extension = null;
				if (!obj.name.equals("embedded-0"))
					fileName = obj.name;
				extension = this.detectFileExtension(fileName);
				
				log.info("Detected uploaded obj Media type is {} and extension is {}", obj.contentType, extension);
				
				String mediaType = getMediaType(stream, fileName);

				log.info("Detected Media type is {}", mediaType);

				log.info("allowedExtension is {}", allowedExtension);
				if (obj.contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
					if (!(allowedExtension.contains("docx") || allowedExtension.contains("doc")))
						r.isValid = false;

				if (obj.contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
					if (!(allowedExtension.contains("xlsx") || allowedExtension.contains("xls")))
						r.isValid = false;

				if (obj.contentType.equals("application/vnd.openxmlformats-officedocument.presentationml.presentation"))
					if (!(allowedExtension.contains("pptx") || allowedExtension.contains("ppt")))
						r.isValid = false;				
				if (obj.contentType.startsWith("text/plain") || obj.contentType.equals("text/plain; charset=ISO-8859-1") || obj.contentType.equals("text/plain; charset=windows-1251"))
					if (!(allowedExtension.contains("text") || allowedExtension.contains("text/plain") || allowedExtension.contains("txt")))
						r.isValid = false;

				if (obj.contentType.equals("application/octet-stream"))
					if (!(allowedExtension.contains("text/binary") || allowedExtension.contains("txt/octet-stream"))) 						
						r.isValid = false;					
				if (obj.contentType.equals("application/xml"))
					if((extension.equals("application/octet-stream") && allowedExtension.contains("bpmn")) || extension.equals("application/xml"))
						break;
					else
						r.isValid = false;
				if (obj.contentType.equals("application/pdf"))
					if (!allowedExtension.contains("pdf"))
						r.isValid = false;
				
				if ((obj.contentType.equals("application/bat") || obj.contentType.equals("application/x-bat")))
					if (!allowedExtension.contains("bat"))
						r.isValid = false;
				
				if (obj.contentType.equals("text/x-csharp"))
					if (!allowedExtension.contains("cs"))
						r.isValid = false;
				
				if (obj.contentType.equals("text/x-python"))
					if (!allowedExtension.contains("py"))
						r.isValid = false;

				if (obj.contentType.equals("application/zip"))
					if (!allowedExtension.contains("zip"))
						r.isValid = false;
				
				if (obj.contentType.equals("application/bat") || obj.contentType.equals("application/x-bat"))
					if (!allowedExtension.contains("bat"))
						r.isValid = false;

				if (obj.contentType.equals("application/x-dosexec"))
					if (!allowedExtension.contains("exe"))
						r.isValid = false;

				if (obj.contentType.equals("image/png"))
					if (!allowedExtension.contains("image/png"))
						r.isValid = false;

				if (obj.contentType.equals("image/jpeg"))
					if (!allowedExtension.contains("image/jpeg"))
						r.isValid = false;
				if (obj.contentType.equals("image/svg+xml"))
					if (!allowedExtension.contains("svg"))
						r.isValid = false;
				if (obj.contentType.equals("text/html; charset=UTF-8"))
					if (!(allowedExtension.contains("htm") || allowedExtension.contains("html")))
						r.isValid = false;
				if (obj.contentType.equals("message/rfc822"))
					if (!(allowedExtension.contains("eml") || allowedExtension.contains("msg")))
						r.isValid = false;
			
				if (!extension.equals(obj.contentType)) {
					if (extension.equals("text/csv") && getMediaType(stream, fileName).contains("text/csv"))
						r.isValid = true;
					else if (extension.equals("application/x-bat") && getMediaType(stream, fileName).contains("application/x-bat"))
						r.isValid = true;
					else if (extension.equals("text/x-csharp") && getMediaType(stream, fileName).contains("text/x-csharp"))
						r.isValid = true;
					else if (extension.equals("text/x-python") && getMediaType(stream, fileName).contains("text/x-python"))
						r.isValid = true;
					else if (extension.equals("application/octet-stream") && getMediaType(stream, fileName).contains("application/octet-stream"))
                        r.isValid = true;					
					else if (extension.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") && getMediaType(stream, fileName).contains("application/octet-stream")) {
                        r.isValid = true;
                    } 
					else if (extension.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") && mediaType.contains("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
                        r.isValid = true;
                    }					
					else if (obj.contentType.contains("application/octet-stream"))
						r.isValid = true;					
					else if (obj.contentType.toLowerCase().startsWith("image/") && extension.toLowerCase().startsWith("image/"))
						r.isValid = true;
					//else if (obj.type.equals("text/plain; charset=ISO-8859-1") && extension.equals("text/plain"))
					else if (extension.startsWith("text/plain") && obj.contentType.contains("text/plain") )						
						r.isValid = true;
					//else if (obj.type.equals("text/plain; charset=windows-1251") && extension.equals("text/plain"))
						//r.isValid = true;
					else if(obj.contentType.equals("application/x-tika-ooxml"))
						r.isValid=true;
					else if (extension.startsWith("text/html") && obj.contentType.contains("text/html"))
						r.isValid = true;
					else {
						r.isValid = false;
						reason1.append("Mismatch extension actual is ");
						reason1.append(obj.normalType != null ? obj.normalType : obj.contentType);
						reason1.append(" but found ");
						reason1.append(extension);
						r.reason = reason1.toString();
						break;
					}
				}
				
				if (!r.isValid) {
					reason2.append("Invalid type found ");
					reason2.append(obj.normalType != null ? obj.normalType : obj.contentType);
					r.reason = reason2.toString();
					break;
				}
			}
		} catch (Exception ex) {
			r.FileName = "";
			r.isValid = false;
			r.reason = "Error while parsing " + ex.getMessage();
		}
		return r;
	}

	private List<UploadObject> getMetaRecursive(InputStream stream) throws IOException, TikaException, SAXException {
		Parser p = new AutoDetectParser();
		ContentHandlerFactory factory = new BasicContentHandlerFactory(BasicContentHandlerFactory.HANDLER_TYPE.HTML,
				-1);
		RecursiveParserWrapper wrapper = new RecursiveParserWrapper(p);
		Metadata metadata = new Metadata();
		// metadata.set(Metadata.RESOURCE_NAME_KEY, "test_recursive_embedded.docx");
		ParseContext context = new ParseContext();

		RecursiveParserWrapperHandler handler = new RecursiveParserWrapperHandler(factory);
		wrapper.parse(stream, handler, metadata, context);

		List<Metadata> list = handler.getMetadataList();

		List<UploadObject> objectList = new ArrayList<UploadObject>();

		for (Metadata l : list) {
			// log.info("Meta is " + l);

			if (l.get("Content-Type") != null && l.get("Content-Type").equals("image/emf"))
				continue;

			UploadObject obj = new UploadObject();

			obj.contentType = l.get("Content-Type");

			// if (l.get(TikaCoreProperties.RESOURCE_NAME_KEY) != null)
			// obj.name = l.get("resourceName");

			obj.name = getResourceName(l);
			if (l.get("extended-properties:Application") != null)
				obj.normalType = l.get("extended-properties:Application");

			if (l.get("File Size") != null)
				obj.size = l.get("File Size");

			if (l.get("X-TIKA:embedded_depth") != null)
				obj.depth = Integer.parseInt(l.get("X-TIKA:embedded_depth"));
			if (l.get("X-TIKA:embedded_resource_path") != null)
				obj.depthPath = l.get("X-TIKA:embedded_resource_path");

			objectList.add(obj);
		}

		return objectList;
	}

	private String getResourceName(Metadata metadata) {
		String objectName = "";
		if (metadata.get(TikaCoreProperties.RESOURCE_NAME_KEY) != null) {
			objectName = metadata.get(TikaCoreProperties.RESOURCE_NAME_KEY);
		} else if (metadata.get(TikaCoreProperties.EMBEDDED_RELATIONSHIP_ID) != null) {
			objectName = metadata.get(TikaCoreProperties.EMBEDDED_RELATIONSHIP_ID);
		} else {
			if (metadata.get("X-TIKA:embedded_depth") != null)
				objectName = "embedded-" + metadata.get("X-TIKA:embedded_depth");

		}

		log.info("objectName is " + objectName);

		objectName = FilenameUtils.getName(objectName);
		return objectName;
	}

	// .docx:
	// application/vnd.openxmlformats-officedocument.wordprocessingml.document
	// .xlsx : application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
	// .doc : application/msword
	// .pdf : application/pdf
	@Deprecated(since = "2.0.1", forRemoval = true)
	public String detectMediaType(File f) throws IOException {
		Tika tika = new Tika();
		String detectedType = tika.detect(f);
		log.info("\n Detected type is : " + detectedType);
		return detectedType;
	}

	@Deprecated(since = "2.0.1", forRemoval = true)
	public String detectMediaType(MultipartFile mulipartFile) {
		Tika tika = new Tika();
		InputStream inputStream;
		try {
			inputStream = mulipartFile.getInputStream();
		} catch (IOException ex) {
			return "Error while conversion to stream " + ex.getMessage();
		}
		String detectedType = null;
		try {
			detectedType = tika.detect(inputStream);
		} catch (IOException ex) {
			return "Error while detecting " + ex.getMessage();
		}
		// log.info("\n Detected type is : " + detectedType);
		return detectedType;
	}

	@Deprecated(since = "2.0.1", forRemoval = true)
	public String detectFileExtension(String fileName) {
		Tika tika = new Tika();
		String fileExtension = tika.detect(fileName);
		// log.info("\n fileExtension is : " + fileExtension);
		return fileExtension;
	}

	@Deprecated(since = "2.0.1", forRemoval = true)
	private String getMediaType(InputStream stream, String fileName) throws IOException {
		DefaultDetector file_detector = new DefaultDetector();
		TikaInputStream file_stream = TikaInputStream.get(stream);
		Metadata metadata = new Metadata();
		metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, fileName);
		org.apache.tika.mime.MediaType mediaType = file_detector.detect(file_stream, metadata);
		return mediaType.toString();
	}
	
	@Deprecated(since = "2.0.1", forRemoval = true)	
	public static void safeClose(FileInputStream fis) {
		 if (fis != null) {
			 try {
				 fis.close();
			 } catch (IOException e) {
				 log.error(e.getMessage());
			 }
		 }
	}
	
}