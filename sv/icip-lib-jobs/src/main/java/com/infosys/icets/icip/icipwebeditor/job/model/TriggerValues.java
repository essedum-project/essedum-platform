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
package com.infosys.icets.icip.icipwebeditor.job.model;

import java.sql.Timestamp;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;

// TODO: Auto-generated Javadoc
/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */
@Data

/**
 * Instantiates a new trigger values.
 *
 * @param nextFireTime the next fire time
 * @param currentFireTime the current fire time
 * @param prevFireTime the prev fire time
 * @param successfulTimestamp the successful timestamp
 */

/**
 * Instantiates a new trigger values.
 *
 * @param nextFireTime the next fire time
 * @param currentFireTime the current fire time
 * @param prevFireTime the prev fire time
 * @param successfulTimestamp the successful timestamp
 */
@AllArgsConstructor
public class TriggerValues {
	
	/** The next fire time. */
	private Date nextFireTime;
	
	/** The current fire time. */
	private Date currentFireTime;
	
	/** The prev fire time. */
	private Timestamp prevFireTime;
	
	/** The successful timestamp. */
	private Timestamp successfulTimestamp;

	/**
	 * Equals.
	 *
	 * @param obj the obj
	 * @return the boolean value
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		TriggerValues other = (TriggerValues) obj;
		if (currentFireTime == null) {
			if (other.currentFireTime != null)
				return false;
		} else if (!currentFireTime.equals(other.currentFireTime))
			return false;
		if (nextFireTime == null) {
			if (other.nextFireTime != null)
				return false;
		} else if (!nextFireTime.equals(other.nextFireTime))
			return false;
		if (prevFireTime == null) {
			if (other.prevFireTime != null)
				return false;
		} else if (!prevFireTime.equals(other.prevFireTime))
			return false;
		if (successfulTimestamp == null) {
			if (other.successfulTimestamp != null)
				return false;
		} else if (!successfulTimestamp.equals(other.successfulTimestamp))
			return false;
		return true;
	}

	/**
	 * hashCode.
	 *
	 * @return the hashcode
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((currentFireTime == null) ? 0 : currentFireTime.hashCode());
		result = prime * result + ((nextFireTime == null) ? 0 : nextFireTime.hashCode());
		result = prime * result + ((prevFireTime == null) ? 0 : prevFireTime.hashCode());
		result = prime * result + ((successfulTimestamp == null) ? 0 : successfulTimestamp.hashCode());
		return result;
	}
}
