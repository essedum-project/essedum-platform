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

package com.lfn.icip.icipwebeditor.rest;

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.icipwebeditor.constants.FileConstants;
import com.lfn.icip.icipwebeditor.folder.service.ICIPFolderService;
import com.lfn.icip.icipwebeditor.model.ICIPAiAgentScript;
import com.lfn.icip.icipwebeditor.model.dto.ICIPAiAgentScriptDTO;
import com.lfn.icip.icipwebeditor.repository.ICIPAiAgentScriptRepository;
import com.lfn.icip.icipwebeditor.service.impl.GitHubService;
import io.micrometer.core.annotation.Timed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.List;

// TODO: Auto-generated Javadoc
// 

/**
 * The Class ICIPFileController.
 *
 * @author essedum
 */
@RestController
@Timed
@RequestMapping(path = "/${icip.pathPrefix}/folder")
public class ICIPFolderController {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPFolderController.class);

	/** The file service. */
	@Autowired
	private ICIPFolderService folderService;

    @Autowired
    private ICIPAiAgentScriptRepository aiAgentScriptRepository;
	
	@Autowired
	private GitHubService githubservice;
	
	@EssedumProperty("icip.script.github.enabled")
	private String remoteScript;



    /**
     * Upload file.
     *
     * @param file the file
     * @return the response entity
     * @throws Exception the exception
     */
    @PostMapping(path = "/upload/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScript>> uploadFile(@PathVariable(name = "cname") String cname,
                                             @PathVariable(name = "org") String org) throws Exception {
        logger.info("request to upload jar-file");
        MultipartFile file = null;
        String zipFolderPath = FileConstants.AI_AGENT_SCRIPT_ZIP_FOLDER_PATH;
        return new ResponseEntity<>(folderService.persistInAiAgentScriptTableFromZipOrFolder(file, zipFolderPath, cname, org), HttpStatus.OK);
    }

    /*@PostMapping(path = "/update/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScript>> updateNativeScriptFile(@PathVariable(name = "cname") String cname,
                                                                          @PathVariable(name = "org") String org, @RequestParam(name = "file") String fileName,
                                                                          @RequestParam(name = "filePath") String filePath, @RequestParam(value = "scriptFile", required = true) MultipartFile script) {
        logger.info("request to update ai-agent script file");
        try {
            return new ResponseEntity<>(folderService.persistInAiAgentScriptTableForSingleFile(script.getBytes(),cname,org,fileName, filePath), HttpStatus.OK);
        } catch (Exception ex) {
            logger.error(ex.getMessage(), ex);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }*/

    @PostMapping(path = "/update/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScript>> bulkUpdateNativeScriptFilesJson(
            @PathVariable(name = "cname") String cname,
            @PathVariable(name = "org") String org,
            @RequestBody List<ICIPAiAgentScriptDTO> updates
    ) {
        logger.info("request to bulk update ai-agent script files via JSON: count={}",
                updates == null ? 0 : updates.size());
        try {
            if (updates == null || updates.isEmpty()) {
                logger.warn("No updates provided in request body.");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            List<ICIPAiAgentScript> result = folderService.bulkUpdateAiAgentScripts(cname, org, updates);
            return new ResponseEntity<>(result, HttpStatus.OK);

        } catch (Exception ex) {
            logger.error("Bulk JSON update failed: {}", ex.getMessage(), ex);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

        /**
        * List.
        *
        * @param cname the cname
        * @param org the org
        * @return the response entity
        * @throws Exception the exception
        */
    @GetMapping(path = "/list/{cname}/{org}")
    public ResponseEntity<List<ICIPAiAgentScriptDTO>> list(
            @PathVariable("cname") String cname,
            @PathVariable("org") String org) throws Exception {
        return ResponseEntity.ok(folderService.listAsDTO(cname, org));
    }

    /**
     * Download file.
     *
     * @param cname the cname
     * @param org the org
     * @return the response entity
     * @throws Exception the exception
     */

    @GetMapping(path = "/download/{cname}/{org}", produces = "application/zip")
    public ResponseEntity<byte[]> downloadAllAsZip(
            @PathVariable("cname") String cname,
            @PathVariable("org") String org
    ) {
        // Generate ZIP in memory from DB
        byte[] zipBytes = folderService.exportZip(cname, org);

        String fileName = (cname + "-" + org + ".zip").replace(' ', '_');

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .body(zipBytes);
    }


    /**
     * Delete file.
     *
     * @param id the script id
     * @return the response entity
     */
    @DeleteMapping(path = "/delete/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable("id") Integer id) {
        logger.info("request to delete ai-agent script file with id: {}", id);
        folderService.deleteFileById(id);
        return ResponseEntity.noContent().build();
    }
    
}