/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.iamp.usm.service;

import java.sql.SQLException;

import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.iamp.usm.domain.UsmNotifications;
import com.infosys.icets.iamp.usm.dto.UsmNotificationsDTO;

// TODO: Auto-generated Javadoc
/**
 * Service Interface for managing UsmNotifications.
 */
/**
* @author icets
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
	public void licenseExpiryNotification(String licenseFilePath) throws SQLException;
    
}
