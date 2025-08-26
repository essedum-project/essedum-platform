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

package com.lfn.iamp.usm.service;

import java.sql.SQLException;

import com.lfn.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.lfn.ai.comm.lib.util.service.dto.support.PageResponse;
import com.lfn.iamp.usm.domain.UsmNotifications;
import com.lfn.iamp.usm.dto.UsmNotificationsDTO;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmNotifications.
 */
/**
* @author essedum
*/
public interface UsmNotificationsService {

    /**
     * Save a usm_notifications.
     *
     * @param usm_notifications the entity to save
     * @return the persisted entity
     */
    UsmNotifications save(UsmNotifications usm_notifications);

    /**
     *  Get all the usm_notificationss with search.
     *
     * @param req the req
     * @return the list of entities
     * @throws SQLException the SQL exception
     */
    PageResponse<UsmNotificationsDTO> getAll(PageRequestByExample<UsmNotifications> req) throws SQLException;

    /**
     * To DTO.
     *
     * @param usm_notifications the usm notifications
     * @param depth the depth
     * @return the usm notifications DTO
     */
    public UsmNotificationsDTO toDTO(UsmNotifications usm_notifications, int depth);

	/**
	 * Save.
	 *
	 * @param usm_notifications_dto the usm notifications dto
	 * @return the usm notifications
	 */
	UsmNotifications save(UsmNotificationsDTO usm_notifications_dto);
    
}
