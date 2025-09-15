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

package com.lfn.icip.icipwebeditor.job.model;

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
