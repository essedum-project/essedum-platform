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

package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.job.model.ICIPChains;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPChainsRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPChainsRepository extends PagingAndSortingRepository<ICIPChains, Integer> , CrudRepository<ICIPChains, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPChains> findByOrganization(String org);

	/**
	 * Find by filter and organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPChains> findByOrganizationFilter(String org,String filter);
	/**
	 * Find by organization.
	 *
	 * @param org      the org
	 * @param pageable the pageable
	 * @return the page
	 */
	Page<ICIPChains> findByOrganization(String org, Pageable pageable);

	/**
	 * Count by organization.
	 *
	 * @param org the org
	 * @return the long
	 */
	Long countByOrganization(String org);

	/**
	 * Find by job name.
	 *
	 * @param name the name
	 * @return the ICIP chains
	 */
	ICIPChains findByJobName(String name);

	/**
	 * Find by job name and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP chains
	 */
	ICIPChains findByJobNameAndOrganization(String name, String org);

	/**
	 * Delete by project.
	 *
	 * @param project the project
	 */
	void deleteByProject(String project);

}
