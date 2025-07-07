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
package com.infosys.icets.icip.icipwebeditor.job.quartz.repository;

import java.util.List;

import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.infosys.icets.icip.icipwebeditor.job.quartz.model.QrtzTriggers;
import com.infosys.icets.icip.icipwebeditor.job.quartz.model.QrtzTriggersId;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPInternalJobsRepository.
 *
 * @author icets
 */
@NoRepositoryBean
public interface QrtzTriggersRepository extends PagingAndSortingRepository<QrtzTriggers, QrtzTriggersId> {

	/**
	 * Find by job group.
	 *
	 * @param group the group
	 * @return the list
	 */
	List<QrtzTriggers> findByJobGroup(String group);

	/**
	 * Find all.
	 *
	 * @return the list
	 */
	List<QrtzTriggers> findAll();

	/**
	 * Find by trigger state.
	 *
	 * @param state the state
	 * @return the list
	 */
	List<QrtzTriggers> findByTriggerState(String state);
	
	
	/**
	 * Save or Update the job.
	 *
	 * @param qrtzTriggers the QrtzTriggers object
	 * @return the QrtzTriggers object
	 */
	QrtzTriggers save(QrtzTriggers qrtzTriggers);

}
