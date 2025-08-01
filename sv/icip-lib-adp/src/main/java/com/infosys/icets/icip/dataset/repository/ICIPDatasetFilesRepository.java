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

import com.infosys.icets.icip.dataset.model.ICIPDatasetFiles;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPDatasetFilesRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPDatasetFilesRepository extends JpaRepository<ICIPDatasetFiles, Integer> {

	/**
	 * Find by datasetname and organization.
	 *
	 * @param name the name
	 * @param org  the org
	 * @param filename the filename
	 * @return the ICIP dataset files
	 */
	public ICIPDatasetFiles findByDatasetnameAndOrganizationAndFilename(String name, String org, String filename);

	/**
	 * Find by id.
	 *
	 * @param id the id
	 * @return the ICIP dataset files
	 */
	public ICIPDatasetFiles findById(String id);

	/**
	 * Find by datasetname and organization.
	 *
	 * @param name the name
	 * @param org the org
	 * @return the list
	 */
	public List<ICIPDatasetFiles> findByDatasetnameAndOrganization(String name, String org);

	public List<ICIPDatasetFiles> findByOrganization(String org);
}