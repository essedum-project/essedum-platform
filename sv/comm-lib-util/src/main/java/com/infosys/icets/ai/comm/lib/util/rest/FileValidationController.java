/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
/**
 * 
 */
package com.infosys.icets.ai.comm.lib.util.rest;


import java.io.File;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.infosys.icets.ai.comm.lib.util.FileValidate;
import com.infosys.icets.ai.comm.lib.util.FileValidateV2;
import com.infosys.icets.ai.comm.lib.util.HeadersUtil;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExtensionKeyInvalidValue;
import com.infosys.icets.ai.comm.lib.util.exceptions.ExtensionKeyNotFoundException;
import com.infosys.icets.ai.comm.lib.util.exceptions.InvalidProjectRequestHeader;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;


/**
 * @author icets
 *
 */
@RestController

@RequestMapping("/api/validate")
@Tag(name = "Common")
public class FileValidationController {
	@Autowired
	private FileValidate fileValidateService;
	
	@Autowired
	private FileValidateV2 fileValidateServiceV2;
	
	@Autowired
    private HttpServletRequest request;


	@CrossOrigin
	@PostMapping("/v2/multipartfile")
	@Operation(summary = "Validate the multipart file for embedded objects and extension",description = "Allowed Extension Key and Extension Depth Key  refers to a Key stored in configurations for a particular project where the list of allowed extensions and depth  can be set by the administrator for allowing particular extension and number of nested files inside a Multiple Parts File. First Priority is given to allowed Extension Key which is passed to API,If Key is not given then allowed Extension value is taken from the api. If that is also absent, Then FileUpload.AllowedExtension value is taken from Core Project")
	public ResponseEntity<?> validateMultiPartFileWithAllowedExtensions(
			@RequestParam("file") MultipartFile mpFile,
			@RequestParam(value="allowedExtensionKey",required = false,defaultValue = "FileUpload.AllowedExtension") String allowedExtensionKey,
			@RequestParam(value = "extendedOutput", required = false, defaultValue = "false")Boolean extendedOutput){
		try {
			int projectId =HeadersUtil.getProjectHeader(request);
			
			return new ResponseEntity<>(this.fileValidateServiceV2.validateWithKey(mpFile,allowedExtensionKey,projectId,extendedOutput),HttpStatus.OK);
		} catch (ExtensionKeyNotFoundException e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
			}
		catch(ExtensionKeyInvalidValue e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);			
		} catch (InvalidProjectRequestHeader e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
		}
	}

	@CrossOrigin
	@PostMapping("/v2/file")
	@Operation(summary = "Validate the file for embedded objects and extension",description = "Allowed Extension Key and Extension Depth Key  refers to a Key stored in configurations for a particular project where the list of allowed extensions and depth  can be set by the administrator for allowing particular extension and number of nested files inside a Particular File. First Priority is given to allowed Extension Key which is passed to API,If Key is not given then allowed Extension value is taken from the api. If that is also absent, Then FileUpload.AllowedExtension value is taken from Core Project")
	public ResponseEntity<?> validateFileWithExtensionKey(
			@RequestParam("file") File file,
			@RequestParam(value="allowedExtensionKey",required = false,defaultValue = "FileUpload.AllowedExtension") String allowedExtensionKey,
			@RequestParam(value = "extendedOutput", required = false, defaultValue = "false")Boolean extendedOutput) throws FileNotFoundException{
		try {
			int projectId = HeadersUtil.getProjectHeader(request);
			return new ResponseEntity<>(this.fileValidateServiceV2.validateWithKey(file,allowedExtensionKey,projectId, extendedOutput),HttpStatus.OK);
		} catch (ExtensionKeyNotFoundException e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
		}
		catch(ExtensionKeyInvalidValue e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);			
		} catch (InvalidProjectRequestHeader e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
		}
	}


		
	@CrossOrigin
	@PostMapping("/v2/stream")
	@Operation(summary = "Validate the file stream for embedded objects and extension",description = "Allowed Extension Key and Extension Depth Key  refers to a Key stored in configurations for a particular project where the list of allowed extensions and depth  can be set by the administrator for allowing particular extension and number of nested files inside a Stream. First Priority is given to allowed Extension Key which is passed to API,If Key is not given then allowed Extension value is taken from the api. If that is also absent, Then FileUpload.AllowedExtension value is taken from Core Project" )
	public ResponseEntity<?> validateInputStreamWithOptions(
			@RequestParam("stream") InputStream stream,
			@RequestParam(value="allowedExtensionKey",required = false,defaultValue = "FileUpload.AllowedExtension") String allowedExtensionKey,
			@RequestParam("fileName") String fileName,
			@RequestParam(value = "extendedOutput", required = false, defaultValue = "false")Boolean extendedOutput){
		try {
			int projectId =HeadersUtil.getProjectHeader(request);
			return new ResponseEntity<>(this.fileValidateServiceV2.validateWithKey(stream,allowedExtensionKey,projectId, fileName, extendedOutput),HttpStatus.OK);
		} catch (ExtensionKeyNotFoundException e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);
		}
		catch(ExtensionKeyInvalidValue e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);			
		} catch (InvalidProjectRequestHeader e) {
			return new ResponseEntity<>(e.getMessage(),HttpStatus.FORBIDDEN);	
		}
	}


	@CrossOrigin
	@PostMapping("/file")
	@Operation(summary = "Validate the file for embedded objects and extension")
	@Deprecated(since = "2.0.1", forRemoval = true)
	public ResponseEntity<?> validateFile(
			@RequestParam("file") File file,
			@RequestParam("allowedExtension") List<String> allowedExtensions,
			@RequestParam(value ="allowedDepth", required = false, defaultValue = "0" )Integer allowedDepth,
			@RequestParam(value = "extendedOutput", required = false, defaultValue = "false")Boolean extendedOutput) throws FileNotFoundException{
		return new ResponseEntity<>(this.fileValidateService.validateFile(file, allowedExtensions, allowedDepth, extendedOutput),HttpStatus.OK);
	}
	
	@CrossOrigin
	@PostMapping("/multipartfile")
	@Deprecated(since = "2.0.1", forRemoval = true)
	@Operation(summary = "Validate the multipart file for embedded objects and extension")
	public ResponseEntity<?> validateMultiPartFileWithOptions(
			@RequestParam("file") MultipartFile mpFile,
			@RequestParam("allowedExtension")List<String> allowedExtensions,
			@RequestParam(value ="allowedDepth", required = false, defaultValue = "0" )Integer allowedDepth,
			@RequestParam(value = "extendedOutput", required = false, defaultValue = "false")Boolean extendedOutput){
		return new ResponseEntity<>(this.fileValidateService.validateFile(mpFile, allowedExtensions,allowedDepth,extendedOutput),HttpStatus.OK);
	}
	
	@CrossOrigin
	@PostMapping("/stream")
	@Deprecated(since = "2.0.1", forRemoval = true)
	@Operation(summary = "Validate the file stream for embedded objects and extension")
	public ResponseEntity<?> validateInputStreamWithOptions(
			@RequestParam("stream") InputStream stream,
			@RequestParam("allowedExtension") List<String> allowedExtension,
			@RequestParam("fileName") String fileName,
			@RequestParam(value ="allowedDepth", required = false, defaultValue = "0" )Integer allowedDepth,
			@RequestParam(value = "extendedOutput", required = false, defaultValue = "false")Boolean extendedOutput){
		return new ResponseEntity<>(this.fileValidateService.validateFile(  stream,  allowedExtension, allowedDepth, fileName, extendedOutput),HttpStatus.OK);
	}
}
