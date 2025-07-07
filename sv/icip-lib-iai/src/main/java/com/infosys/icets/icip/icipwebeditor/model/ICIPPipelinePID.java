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
package com.infosys.icets.icip.icipwebeditor.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPipelinePID.
 *
 * @author icets
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
