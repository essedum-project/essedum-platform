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

package com.lfn.icip.icipwebeditor.service.impl;

import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.icipwebeditor.model.ICIPAiAgentScript;
import com.lfn.icip.icipwebeditor.repository.ICIPAiAgentScriptRepository;
import com.lfn.icip.icipwebeditor.service.IICIPAiAgentService;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.rowset.serial.SerialBlob;
import java.io.IOException;
import java.sql.Blob;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

// TODO: Auto-generated Javadoc
// 

/**
 * The Class ICIPNativeScriptService.
 *
 * @author essedum
 */
@Service
public class ICIPAiAgentScriptService implements IICIPAiAgentService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPAiAgentScriptService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The native script repository. */
	private ICIPAiAgentScriptRepository aiAgentScriptRepository;
	
//	@EssedumProperty("icip.script.github.enabled")
//	private String remoteScript;
	
	@Autowired
	private ConstantsService constantsService;
	
	@Autowired
	private GitHubService githubservice;


	/**
	 * Instantiates a new ICIP native script service.
	 *
	 * @param aiAgentScriptRepository the native script repository
	 */
	public ICIPAiAgentScriptService(ICIPAiAgentScriptRepository aiAgentScriptRepository) {
		super();
		this.aiAgentScriptRepository = aiAgentScriptRepository;
	}

	/**
	 * Save.
	 *
	 * @param binaryFile the binary file
	 * @return the ICIP native script
	 */
	@Override
	public ICIPAiAgentScript save(ICIPAiAgentScript icipAiAgentScript) {
		logger.info("saving native script details");
		return aiAgentScriptRepository.customSave(icipAiAgentScript);
	}

	/**
	 * Find by name and org and file.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP native script
	 */
	@Override
	public List<ICIPAiAgentScript> findByNameAndOrg(String name, String org) {
		logger.info("getting native script by name : {}", name);
		return aiAgentScriptRepository.findByCnameAndOrganization(name, org);
	}

    /**
     * Find by name and org and file.
     *
     * @param name the name
     * @param org  the org
     * @param filename the filename
     * @return the ICIP native script
     */
    @Override
    public ICIPAiAgentScript findByNameAndOrgAndFile(String name, String org, String filename, String filePath) {
        logger.info("getting native script by name : {}", name);
        return aiAgentScriptRepository.findByCnameAndOrganizationAndFilenameAndFilePath(name, org, filename, filePath);
    }


	/**
	 * Delete by name and org.
	 *
	 * @param name the name
	 * @param org  the org
	 * @throws SQLException 
	 * @throws IOException 
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	@Override
	public void deleteByNameAndOrg(String name, String org) throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException {
		logger.info("deleting native-script pipeline");
		String remoteScript = null;
		try {
			remoteScript = constantsService.getByKeys("icip.script.github.enabled", org).getValue();
		}catch(NullPointerException ex) {
			remoteScript = "false";
		}catch(Exception ex) {
			logger.error(ex.getMessage());
		}
		
		if(remoteScript.equals("true")) {
			Git git = githubservice.getGitHubRepository(org);
			
			Boolean result = githubservice.pull(git);
			
			githubservice.deleteFileFromLocalRepo(git,name,org);
			
			if(result==true) {
				githubservice.push(git,"Pipeline script deleted : "+name);
				logger.info("Successfully deleted script from Git");
			}
			
		}
		else {
			List<ICIPAiAgentScript> fetched = aiAgentScriptRepository.findByCnameAndOrganization(name, org);
			/*if (fetched != null) {
				aiAgentScriptRepository.deleteByCnameAndOrg(fetched.getCname(),fetched.getOrganization());
	//			aiAgentScriptRepository.deleteById(fetched.getId());
			}*/

            if (fetched != null && !fetched.isEmpty()) {
                for (ICIPAiAgentScript script : fetched) {
                    aiAgentScriptRepository.deleteById(script.getId()); // ✅ Delete by ID
                }
            }

        }
	}

	/**
	 * Update file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @param file     the file
	 * @return the ICIP native script
	 */
	@Override
	public List<ICIPAiAgentScript> updateFile(String name, String org, String filename, SerialBlob file, String filePath) throws SQLException {
		logger.info("updating native script : {}", filename);
		List<ICIPAiAgentScript> binaryFile = aiAgentScriptRepository.findByCnameAndOrganization(name, org);
        for (ICIPAiAgentScript script : binaryFile) {
            if (script.getFilename() != null && script.getFilePath() != null &&
                    script.getFilename().equalsIgnoreCase(filename) &&
                    script.getFilePath().endsWith(filePath)) {
                Blob blob = new SerialBlob(file);
                logger.info("Updating existing script: {} at path: {}", filename, filePath);
                script.setFilescript(blob);
                aiAgentScriptRepository.save(script);
                break;
            }
        }
		return aiAgentScriptRepository.findByCnameAndOrganization(name,org);
	}

	/**
	 * Copy.
	 *
	 * @param marker        the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean copy(Marker marker, String fromProjectId, String toProjectId) {
		joblogger.info(marker, "Fetching events for Entity {}", fromProjectId);
		List<ICIPAiAgentScript> event = aiAgentScriptRepository.findByOrganization(fromProjectId);
		List<ICIPAiAgentScript> toMod = event.parallelStream().map(model -> {
			model.setId(null);
			model.setOrganization(toProjectId);
			return model;
		}).collect(Collectors.toList());
		toMod.stream().forEach(model -> {
			try {
				aiAgentScriptRepository.save(model);
			} catch (DataIntegrityViolationException e) {
				logger.error("Error in saving aiAgentScriptRepository");
				joblogger.error(marker, e.getMessage());
			}
		});
		return true;
	}

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	@Override
	public void delete(String project) {
		aiAgentScriptRepository.deleteByProject(project);
	}

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP ai agent script
	 */
	@Override
	public ICIPAiAgentScript findById(Integer id) {
		logger.info("getting ai agent script by id: {}", id);
		return aiAgentScriptRepository.findById(id).orElse(null);
	}

	/**
	 * Delete by id.
	 *
	 * @param id the id
	 */
	@Override
	@Transactional
	public void deleteById(Integer id) {
		logger.info("deleting ai agent script by id: {}", id);
		aiAgentScriptRepository.deleteById(id);
	}

	@Override
	public List<ICIPAiAgentScript> findByOrg(String org) {
		return aiAgentScriptRepository.findByOrganization(org);
	}

}
