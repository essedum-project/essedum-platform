package com.lfn.icip.icipwebeditor.fileserver.rest;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FilenameUtils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.fileserver.service.impl.FileServerService;

import io.micrometer.core.annotation.Timed;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@Timed
@RequestMapping("/${icip.pathPrefix}/fileserver")
@Tag(name = "fileserver")
@RefreshScope
public class FileServerController {
	
	/** The fileserver service. */
	@Autowired
	private FileServerService fileserverService;

	// Download File using fileId
	@GetMapping("/downloadFile/{fileId}/{org}")
	public ResponseEntity<byte[]> getAttachmentedSolutionFiles(@PathVariable("fileId") String id,
			@PathVariable("org") String org) throws Exception {
		byte[] response;
		ByteArrayOutputStream allbytes = new ByteArrayOutputStream();
		int count = Integer.parseInt(fileserverService.getLastIndex(id, org));
		for (int i = 0; i <= count; i++) {
			allbytes.write(fileserverService.download(id, String.valueOf(i), org));
		}
		response = allbytes.toByteArray();
		return new ResponseEntity<byte[]>(response, new HttpHeaders(), HttpStatus.OK);
	}
	
	@PostMapping(value = "/upload")
	public ResponseEntity<String> uploadformio(@RequestPart("file") MultipartFile file,
			@RequestParam("org") String org, @RequestParam("selectedRoles") List <String> selectedRoles) throws Exception {

		String fileid = fileserverService.generateFileID(org, "formio");
		
		ICIPChunkMetaData metadata = new ICIPChunkMetaData(file.getOriginalFilename(), 0, 1, file.getSize(),
				FilenameUtils.getExtension(file.getOriginalFilename()), fileid, "formio");
		fileserverService.fileUploadHelper1(fileid, org, file, metadata, "true", selectedRoles);

		return new ResponseEntity<>(fileid, HttpStatus.OK);
	}
	
	/*
	 * Uploads File as Temporary File and Temporary Folder to Server
	 */
	@PostMapping(value = "/uploadTemp")
	public ResponseEntity<Map<String,String>> uploadformioTemp(@RequestPart("file") MultipartFile file) throws Exception {
		Map<String,String> fileDetails=fileserverService.uploadTemp(file);
		return new ResponseEntity<>(fileDetails, HttpStatus.OK);
	}
	
	@PostMapping(value = "/uploadTempFileFromData")
	public ResponseEntity<Map<String,String>> uploadTempFileFromData(@RequestBody String fileData) throws Exception {
		JSONObject jsonObject= new JSONObject(fileData);
		Map<String,String> fileDetails=fileserverService.uploadTempFileFromData(jsonObject);
		return new ResponseEntity<>(fileDetails, HttpStatus.OK);
	}
	
	@PostMapping(value = "/uploadMultipleFile")
	public ResponseEntity<List<Map<String,String>>> uploadMultipleFile(@RequestPart("files") MultipartFile[] files) throws Exception {
		List<Map<String,String>> fileDetailsList = new ArrayList<>();
		for(MultipartFile filedata:files) {
			Map<String,String> fileDetails = fileserverService.uploadTemp(filedata);
			fileDetailsList.add(fileDetails);
		}
		return new ResponseEntity<>(fileDetailsList, HttpStatus.OK);
	}
	
	/*
	 * Deletes Temporary File and Temporary Folder from Server
	 */
	@PostMapping(value = "/deleteTemp")
	public ResponseEntity<Map<String,String>> deleteTempFile(@RequestBody Map<String,String> fileDetails){
		Map<String,String> deleteFile=fileserverService.deleteUploadedTemp(fileDetails);
		return new ResponseEntity<>(deleteFile, HttpStatus.OK);
	}
	
	@PostMapping(value = "/uploadChunks/{org}", consumes = { "multipart/form-data" })
    public ResponseEntity<Map<String,String>> uploadChunkData(@PathVariable(value = "org") String organization,
            @RequestPart("chunkMetadata") String metadata,
            @RequestPart("file") MultipartFile file) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        ICIPChunkMetaData chunkMetaData = mapper.readValue(metadata, ICIPChunkMetaData.class);
        String  fileid = ICIPUtils.removeSpecialCharacter(chunkMetaData.getFileGuid());
        Map<String,String> chunkFileDetails = fileserverService.saveFileChunk(file, chunkMetaData, organization, fileid);
        return new ResponseEntity<>(chunkFileDetails, HttpStatus.OK);
    }
	
}