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
package com.infosys.icets.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.icipwebeditor.model.ICIPNativeScript;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPNativeScriptRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPNativeScriptRepository extends JpaRepository<ICIPNativeScript, Integer> {

	/**
	 * Find by cname and organization and filename.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP native script
	 */
	ICIPNativeScript findByCnameAndOrganizationAndFilename(String cname, String org, String filename);

	/**
	 * Find by cname and organization.
	 *
	 * @param cname the cname
	 * @param org   the org
	 * @return the ICIP native script
	 */
	ICIPNativeScript findByCnameAndOrganization(String cname, String org);

	/**
	 * Find by organization.
	 *
	 * @param org the org
	 * @return the list
	 */
	List<ICIPNativeScript> findByOrganization(String org);

	/**
	 * Delete by project.
	 *
	 * @param org the org
	 */
	void deleteByProject(String org);
	
	ICIPNativeScript customSave(ICIPNativeScript nativeScript);

	void deleteByCnameAndOrg(String cname, String org);
}
