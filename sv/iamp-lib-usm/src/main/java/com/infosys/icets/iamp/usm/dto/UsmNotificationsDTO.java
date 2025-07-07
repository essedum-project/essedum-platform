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
package com.infosys.icets.iamp.usm.dto;

import java.io.Serializable;
import java.time.ZonedDateTime;

import com.infosys.icets.iamp.usm.domain.Role;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmNotificationsDTO.
 *
 * @author icets
 */

/**
 * Gets the read flag.
 *
 * @return the read flag
 */

/**
 * Gets the read flag.
 *
 * @return the read flag
 */
@Getter 
 
 /**
  * Sets the read flag.
  *
  * @param readFlag the new read flag
  */
 
 /**
  * Sets the read flag.
  *
  * @param readFlag the new read flag
  */
 @Setter
 
 /**
  * To string.
  *
  * @return the java.lang. string
  */
 @ToString
public class UsmNotificationsDTO implements Serializable {
	
	/** The id. */
	private Integer id;

	/** The user id. */
	private String userId;

	/** The severity. */
	private String severity;

	/** The source. */
	private String source;

	/** The message. */
	private String message;

	/** The date time. */
	private ZonedDateTime dateTime;
	
	/** The read flag. */
	private Boolean readFlag;

	private Integer roleId;
	
	private String actionLink;

	private Integer raisedBy;
	private String actionType;
	private String entityType;
	private Integer entityId;
	

}
