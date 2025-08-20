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

package com.lfn.icip.icipwebeditor.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPipelinePID.
 *
 * @author essedum
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlpipelinepid")

/**
 * Gets the status.
 *
 * @return the status
 */

/**
 * Gets the status.
 *
 * @return the status
 */

/**
 * Gets the status.
 *
 * @return the status
 */
@Getter

/**
 * Sets the status.
 *
 * @param status the new status
 */

/**
 * Sets the status.
 *
 * @param status the new status
 */

/**
 * Sets the status.
 *
 * @param status the new status
 */
@Setter

/**
 * Instantiates a new ICIP pipeline PID.
 */

/**
 * Instantiates a new ICIP pipeline PID.
 */

/**
 * Instantiates a new ICIP pipeline PID.
 */
@NoArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPPipelinePID {

	/** The sno. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer sno;

	/** The jobid. */
	private String jobid;

	/** The macaddress. */
	private String instanceid;

	/** The pid. */
	private String pid;

	/** The status. */
	private Integer status;

	/**
	 * Instantiates a new ICIP pipeline PID.
	 *
	 * @param jobid the jobid
	 * @param instanceid the instanceid
	 * @param pid   the pid
	 */
	public ICIPPipelinePID(String jobid, String instanceid, String pid) {
		this.jobid = jobid;
		this.instanceid = instanceid;
		this.pid = pid;
		this.status = 0;
	}

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
		ICIPPipelinePID other = (ICIPPipelinePID) obj;
		if (this.getSno() == null) {
			if (other.getSno() != null)
				return false;
		} else if (!sno.equals(other.getSno()))
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
		result = prime * result + ((this.getSno() == null) ? 0 : sno.hashCode());
		return result;
	}

}
