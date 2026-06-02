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

package com.lfn.icip.icipwebeditor.job.quartz.repository;

import java.util.List;

import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.lfn.icip.icipwebeditor.job.quartz.model.QrtzTriggers;
import com.lfn.icip.icipwebeditor.job.quartz.model.QrtzTriggersId;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface ICIPInternalJobsRepository.
 *
 * @author essedum
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
