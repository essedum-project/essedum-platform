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

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.icipwebeditor.model.ICIPBinaryFiles;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPBinaryFilesRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPBinaryFilesRepository extends JpaRepository<ICIPBinaryFiles, Integer> {

	/**
	 * Find by cname and organization and filename.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP binary files
	 */
	ICIPBinaryFiles findByCnameAndOrganizationAndFilename(String cname, String org, String filename);

	/**
	 * Find by cname and organization.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @return the ICIP binary files
	 */
	ICIPBinaryFiles findByCnameAndOrganization(String cname, String org);

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPBinaryFiles> findByOrganization(String org);

	/**
	 * Delete by project.
	 *
	 * @param org the org
	 */
	void deleteByProject(String org);
}
