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

package com.infosys.icets.icip.icipmodelserver.service;

import java.util.List;

import com.infosys.icets.icip.icipmodelserver.model.ICIPModelServers;

// TODO: Auto-generated Javadoc
/**
 * The Interface IICIPModelServersService.
 */
public interface IICIPModelServersService {
	
	/**
	 * Save.
	 *
	 * @param modelServer the model server
	 * @return the ICIP model servers
	 */
	ICIPModelServers save(ICIPModelServers modelServer);

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP model servers
	 */
	ICIPModelServers findById(Integer id);

	/**
	 * Find all.
	 *
	 * @return the list
	 */
	List<ICIPModelServers> findAll();

	/**
	 * Find inactive model servers.
	 *
	 * @return the list
	 */
	List<ICIPModelServers> findInactiveModelServers();

	/**
	 * Delete.
	 *
	 * @param server the server
	 */
	void delete(ICIPModelServers server);

	/**
	 * Resolve model server.
	 *
	 * @return the ICIP model servers
	 */
	ICIPModelServers resolveModelServer();
}
