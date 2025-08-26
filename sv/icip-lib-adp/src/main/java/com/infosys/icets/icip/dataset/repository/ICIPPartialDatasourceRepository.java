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

package com.infosys.icets.icip.dataset.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.dataset.model.ICIPPartialDatasource;

// TODO: Auto-generated Javadoc
// 
/**
 * Spring Data JPA repository for the ICIPDataset entity.
 */
/**
 * @author icets
 */
@NoRepositoryBean
public interface ICIPPartialDatasourceRepository extends JpaRepository<ICIPPartialDatasource, Integer> {

	/**
	 * Find by organization.
	 *
	 * @param organization the organization
	 * @return the list
	 */
	List<ICIPPartialDatasource> findByOrganization(String organization);

	/**
	 * Find by name and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the ICIP partial datasource
	 */
	ICIPPartialDatasource findByNameAndOrganization(String name, String org);

	/**
	 * Find by organization and groups.
	 *
	 * @param organization the organization
	 * @param groupName    the group name
	 * @return the list
	 */
	List<ICIPPartialDatasource> findByOrganizationAndGroups(String organization, String groupName);
}
