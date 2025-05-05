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
package com.infosys.icets.icip.dataset.repository.jpql;

import java.util.List;

//import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.infosys.icets.icip.dataset.model.ICIPSpecTemplate;
//import com.infosys.icets.icip.dataset.repository.ICIPSpecTemplatesRepository;
//COMMENTED AS PART OF API CLEANUP

//@Profile("mysql")
//@Repository
//public interface ICIPSpecTemplatesRepositoryJPQL extends ICIPSpecTemplatesRepository {
//
//	/*
//	 * native Queries
//	 * 
//	 * @Query(value = "SELECT * FROM spectemplates sp where sp.templateName = ?1",
//	 * nativeQuery = true) ICIPSpecTemplate searchByTemplateName(String
//	 * templateName);
//	 * 
//	 * @Query(value = "SELECT sp.templateName FROM spectemplates sp", nativeQuery =
//	 * true) List<String> getAllTemplateNames();
//	 * 
//	 * @Query(value = "SELECT * FROM spectemplates sp", nativeQuery = true)
//	 * List<ICIPSpecTemplate> getAllSpecTemplates();
//	 */
//	/* JPQL Queries */
//	@Query("SELECT sp FROM ICIPSpecTemplate sp where sp.templateName = ?1")
//	ICIPSpecTemplate searchByTemplateName(String templateName);
//
//	@Query("SELECT sp.templateName FROM ICIPSpecTemplate sp")
//	List<String> getAllTemplateNames();
//
//	@Query("SELECT sp FROM ICIPSpecTemplate sp")
//	List<ICIPSpecTemplate> getAllSpecTemplates();
//}