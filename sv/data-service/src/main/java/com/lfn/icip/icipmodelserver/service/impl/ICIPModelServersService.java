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

package com.lfn.icip.icipmodelserver.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.lfn.icip.icipmodelserver.model.ICIPModelServers;
import com.lfn.icip.icipmodelserver.repository.ICIPModelServersRepository;
import com.lfn.icip.icipmodelserver.service.IICIPModelServersService;

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
