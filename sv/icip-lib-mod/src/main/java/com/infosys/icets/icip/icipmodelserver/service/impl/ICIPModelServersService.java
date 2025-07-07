/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipmodelserver.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infosys.icets.icip.icipmodelserver.model.ICIPModelServers;
import com.infosys.icets.icip.icipmodelserver.repository.ICIPModelServersRepository;
import com.infosys.icets.icip.icipmodelserver.service.IICIPModelServersService;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPModelServersService.
 */
@Service

/** The Constant log. */

/** The Constant log. */
@Log4j2
public class ICIPModelServersService implements IICIPModelServersService {

	/** The icip model servers repository. */
	private ICIPModelServersRepository icipModelServersRepository;

	/**
	 * Instantiates a new ICIP model servers service.
	 *
	 * @param icipModelServersRepository the icip model servers repository
	 */
	public ICIPModelServersService(ICIPModelServersRepository icipModelServersRepository) {
		this.icipModelServersRepository = icipModelServersRepository;
	}

	/**
	 * Find all.
	 *
	 * @return the list
	 */
	@Override
	public List<ICIPModelServers> findAll() {
		log.info("find all model servers");
		return icipModelServersRepository.findAll();
	}

	/**
	 * Find inactive model servers.
	 *
	 * @return the list
	 */
	@Override
	public List<ICIPModelServers> findInactiveModelServers() {
		log.info("find all inactive model servers");
		return icipModelServersRepository.findInactiveModelServers();
	}

	/**
	 * Save.
	 *
	 * @param modelServer the model server
	 * @return the ICIP model servers
	 */
	@Override
	public ICIPModelServers save(ICIPModelServers modelServer) {
		log.info("saving model server");
		return icipModelServersRepository.save(modelServer);
	}

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP model servers
	 */
	@Override
	public ICIPModelServers findById(Integer id) {
		log.info("getting model server by id : {}", id);
		return icipModelServersRepository.findById(id).orElse(null);
	}

	/**
	 * Resolve model server.
	 *
	 * @return the ICIP model servers
	 */
	@Override
	public ICIPModelServers resolveModelServer() {
		log.info("getting next free model server");
		return icipModelServersRepository.resolveModelServer();
	}

	/**
	 * Delete.
	 *
	 * @param server the server
	 */
	@Override
	public void delete(ICIPModelServers server) {
		icipModelServersRepository.delete(server);
	}

}
