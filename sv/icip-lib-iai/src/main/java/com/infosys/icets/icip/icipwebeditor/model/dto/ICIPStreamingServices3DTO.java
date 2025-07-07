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
package com.infosys.icets.icip.icipwebeditor.model.dto;

import java.io.Serializable;
import java.sql.Timestamp;


// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPStreamingServices3DTO.
 */
public interface ICIPStreamingServices3DTO extends Serializable {
	
	/**
	 * Gets the cid.
	 *
	 * @return the cid
	 */
	Integer getCid();

	/**
	 *  The name.
	 *
	 * @return the name
	 */
	String getName();

	/**
	 *  The alias.
	 *
	 * @return the alias
	 */
	String getAlias();

	/**
	 *  The description.
	 *
	 * @return the description
	 */
	String getDescription();

	/**
	 *  The deleted.
	 *
	 * @return the deleted
	 */
	boolean getDeleted();

	/**
	 *  The type.
	 *
	 * @return the type
	 */
	String getType();
	String getInterfacetype(); 
	/**
	 *  The organization.
	 *
	 * @return the organization
	 */
	String getOrganization();

	/**
	 *  The created date.
	 *
	 * @return the created date
	 */
	Timestamp getCreatedDate();

	/**
	 *  The finished.
	 *
	 * @return the finished
	 */
	int getFinished();

	/**
	 *  The running.
	 *
	 * @return the running
	 */
	int getRunning();

	/**
	 *  The killed.
	 *
	 * @return the killed
	 */
	int getKilled();

	/**
	 *  The error.
	 *
	 * @return the error
	 */
	int getError();

}
