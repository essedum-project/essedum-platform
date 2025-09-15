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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.json.JSONObject;
import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.icipwebeditor.job.model.ICIPChains;
import com.lfn.icip.icipwebeditor.model.ICIPEventJobMapping;
import com.lfn.icip.icipwebeditor.repository.ICIPChainsRepository;
import com.lfn.icip.icipwebeditor.service.IICIPChainsService;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPChainsService.
 *
 * @author essedum
 */
@Service
@Transactional
public class ICIPChainsService implements IICIPChainsService {

	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPChainsService.class);

	/** The Constant joblogger. */
	private static final Logger joblogger = LoggerFactory.getLogger(JobLogger.class);

	/** The i CIP chains repository. */
	private ICIPChainsRepository iCIPChainsRepository;

	/**
	 * Instantiates a new ICIP chains service.
	 *
	 * @param iCIPChainsRepository the i CIP chains repository
	 */
	public ICIPChainsService(ICIPChainsRepository iCIPChainsRepository) {
		super();
		this.iCIPChainsRepository = iCIPChainsRepository;
	}

	/**
	 * Gets the all jobs.
	 *
	 * @param org  the org
	 * @param page the page
	 * @param size the size
	 * @return the all jobs
	 */
	@Override
	public List<ICIPChains> getAllJobs(String org, int page, int size) {
		logger.info("Getting jobs in Page {}", page);
		Pageable paginate = PageRequest.of(page, size);
		Page<ICIPChains> jobs = iCIPChainsRepository.findByOrganization(org, paginate);
		return jobs.toList();
	}

	/**
	 * Gets the all jobs.
	 *
	 * @param org the org
	 * @return the all jobs
	 */
	@Override
	public List<ICIPChains> getAllJobs(String org,String filter) {
		logger.info("Getting jobs");
		return iCIPChainsRepository.findByOrganizationFilter(org,filter);
	}

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	@Override
	public Long countByOrganization(String org) {
		return iCIPChainsRepository.countByOrganization(org);
	}

	/**
	 * Rename project.
	 *
	 * @param fromProjectId the from project id
	 * @param toProjectId   the to project id
	 * @return true, if successful
	 */
	@Override
	public boolean renameProject(String fromProjectId, String toProjectId) {
		List<ICIPChains> dsets = iCIPChainsRepository.findByOrganization(fromProjectId);
		dsets.stream().forEach(ds -> {
			ds.setOrganization(toProjectId);
			iCIPChainsRepository.save(ds);
		});
		return true;
	}

	/**
	 * Save.
	 *
	 * @param chain the chain
	 * @return the ICIP chains
	 */
	@Override
	public ICIPChains save(ICIPChains chain) {
		logger.info("Saving Job by Name {}", chain.getJobName());
		return iCIPChainsRepository.save(chain);
	}

	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the ICIP chains
	 */
	@Override
	public ICIPChains findByName(String name) {
		logger.info("Fetching job by Name {}", name);
		return iCIPChainsRepository.findByJobName(name);
	}

	/**
	 * Find by name.
	 *
	 * @param name the name
	 * @return the ICIP chains
	 */
	@Override
	public Optional<ICIPChains> findChainByID(Integer id) {
		logger.info("Fetching job by id {}", id);
		return iCIPChainsRepository.findById(id);
	}
	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chains
	 */
	@Override
	public ICIPChains findByNameAndOrganization(String name, String org) {
		logger.info("Fetching job by Name {} and Org {}", name, org);
		return iCIPChainsRepository.findByJobNameAndOrganization(name, org);
	}

	/**
	 * Delete job.
	 *
	 * @param id the id
	 */
	@Override
	public void deleteJob(Integer id) {
		iCIPChainsRepository.deleteById(id);
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
		joblogger.info(marker, "Fetching jobs for Entity {}", fromProjectId);
		List<ICIPChains> icGrps = iCIPChainsRepository.findByOrganization(fromProjectId);
		List<ICIPChains> toGrps = icGrps.parallelStream().map(grp -> {
			grp.setId(null);
			grp.setOrganization(toProjectId);
			return grp;
		}).collect(Collectors.toList());
		toGrps.stream().forEach(grp -> {
			try {
				iCIPChainsRepository.save(grp);
			} catch (DataIntegrityViolationException e) {
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
		iCIPChainsRepository.deleteByProject(project);
	}
	
	public JsonObject export(Marker marker, String source, JSONArray modNames) {
		JsonObject jsnObj = new JsonObject();
		try {
			joblogger.info(marker, "Exporting grouped_jobs started");
			Gson gson = new GsonBuilder().disableHtmlEscaping().create();
//			List<ICIPChains> chains = iCIPChainsRepository.findByOrganization(source);
			List<ICIPChains> chains = new ArrayList<>();
			
			modNames.forEach(jobName -> {
				chains.add(iCIPChainsRepository.findByJobNameAndOrganization(jobName.toString(), source));
			});
			jsnObj.add("mlchains", gson.toJsonTree(chains));
			joblogger.info(marker, "Exported grouped_jobs Successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in exporting grouped_jobs");
			joblogger.error(marker, ex.getMessage());
		}
		return jsnObj;
	}

	public void importData(Marker marker, String target, JSONObject data) {
		Gson g = new Gson();
		try {
			joblogger.info(marker, "Importing grouped_jobs started");
			JsonArray chains = g.fromJson(data.get("mlchains").toString(), JsonArray.class);
			chains.forEach(x -> {
				ICIPChains ch = g.fromJson(x, ICIPChains.class);
				ch.setOrganization(target);
				ch.setId(null);
				try {
					iCIPChainsRepository.save(ch);
				}
				catch(DataIntegrityViolationException de) {
					joblogger.error(marker, "Error in importing duplicate grouped_jobs {}",ch.getJobName());
				}
			});
			joblogger.info(marker, "Imported grouped_jobs successfully");
		}
		catch(Exception ex) {
			joblogger.error(marker, "Error in importing grouped_jobs");
			joblogger.error(marker, ex.getMessage());
		}
	}

}