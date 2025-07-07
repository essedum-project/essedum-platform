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

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.icipwebeditor.model.ICIPDragAndDrop;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPDragAndDropRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface ICIPDragAndDropRepository extends JpaRepository<ICIPDragAndDrop, Integer> {

	/**
	 * Find by cname and organization and filename.
	 *
	 * @param cname    the cname
	 * @param org      the org
	 * @param filename the filename
	 * @return the ICIP drag and drop
	 */
	ICIPDragAndDrop findByCnameAndOrganizationAndFilename(String cname, String org, String filename);
}
