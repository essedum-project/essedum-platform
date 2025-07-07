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