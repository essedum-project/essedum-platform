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

package com.infosys.icets.icip.icipwebeditor.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.stream.Collectors;

import javax.sql.rowset.serial.SerialBlob;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.annotation.service.ConstantsService;
import com.infosys.icets.ai.comm.lib.util.logger.JobLogger;
import com.infosys.icets.icip.icipwebeditor.model.ICIPNativeScript;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPNativeScriptRepository;
import com.infosys.icets.icip.icipwebeditor.service.IICIPNativeScriptService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPNativeScriptService.
 *
 * @author icets
 */
@Service
public class ICIPNativeScriptService implements IICIPNativeScriptService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPNativeScriptService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The native script repository. */
	private ICIPNativeScriptRepository nativeScriptRepository;
	
//	@LeapProperty("icip.script.github.enabled")
//	private String remoteScript;
	
	@Autowired
	private ConstantsService constantsService;
	
	@Autowired
	private GitHubService githubservice;


	/**
	 * Instantiates a new ICIP native script service.
	 *
	 * @param nativeScriptRepository the native script repository
	 */
	public ICIPNativeScriptService(ICIPNativeScriptRepository nativeScriptRepository) {
		super();
		this.nativeScriptRepository = nativeScriptRepository;
	}

	/**
	 * Save.
	 *
	 * @param binaryFile the binary file
	 * @return the ICIP native script
	 */
	@Override
	public ICIPNativeScript save(ICIPNativeScript nativescript) {
		logger.info("saving native script details");
		return nativeScriptRepository.customSave(nativescript);
	}

	/**
	 * Find by name and org and file.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP native script
	 */
	@Override
	public ICIPNativeScript findByNameAndOrg(String name, String org) {
		logger.info("getting native script by name : {}", name);
		return nativeScriptRepository.findByCnameAndOrganization(name, org);
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
			ICIPNativeScript fetched = nativeScriptRepository.findByCnameAndOrganization(name, org);
			if (fetched != null) {
				nativeScriptRepository.deleteByCnameAndOrg(fetched.getCname(),fetched.getOrganization());
	//			nativeScriptRepository.deleteById(fetched.getId());
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
	public ICIPNativeScript updateFile(String name, String org, String filename, SerialBlob file) {
		logger.info("updating native script : {}", filename);
		ICIPNativeScript binaryFile = nativeScriptRepository.findByCnameAndOrganization(name, org);
		binaryFile.setFilescript(file);
		binaryFile.setFilename(filename);
		return nativeScriptRepository.save(binaryFile);
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
		List<ICIPNativeScript> event = nativeScriptRepository.findByOrganization(fromProjectId);
		List<ICIPNativeScript> toMod = event.parallelStream().map(model -> {
			model.setId(null);
			model.setOrganization(toProjectId);
			return model;
		}).collect(Collectors.toList());
		toMod.stream().forEach(model -> {
			try {
				nativeScriptRepository.save(model);
			} catch (DataIntegrityViolationException e) {
				logger.error("Error in saving nativeScriptRepository");
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
		nativeScriptRepository.deleteByProject(project);
	}
	
	@Override
	public List<ICIPNativeScript> findByOrg(String org) {
		return nativeScriptRepository.findByOrganization(org);
	}

}
