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
package com.infosys.icets.icip.icipmodelserver.model;

import java.io.Serializable;
import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;

import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.Data;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPModelServers.
 */
//@MappedSuperclass
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlmodelservers")

/**
 * Instantiates a new ICIP model servers.
 */

/**
 * Instantiates a new ICIP model servers.
 */
@Data
public class ICIPModelServers implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The url. */
	private String url;
	
	/** The lastcall. */
	private Timestamp lastcall;
	
	/** The serverload. */
	private Integer serverload;

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
		ICIPModelServers other = (ICIPModelServers) obj;
		if (this.getId() == null) {
			if (other.getId() != null)
				return false;
		} else if (!id.equals(other.getId()))
			return false;
		if (this.getLastcall() == null) {
			if (other.getLastcall() != null)
				return false;
		} else if (!lastcall.equals(other.getLastcall()))
			return false;
		if (this.getServerload() == null) {
			if (other.getServerload() != null)
				return false;
		} else if (!serverload.equals(other.getServerload()))
			return false;
		if (this.getUrl() == null) {
			if (other.getUrl() != null)
				return false;
		} else if (!url.equals(other.getUrl()))
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
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		result = prime * result + ((this.getLastcall() == null) ? 0 : lastcall.hashCode());
		result = prime * result + ((this.getServerload() == null) ? 0 : serverload.hashCode());
		result = prime * result + ((this.getUrl() == null) ? 0 : url.hashCode());
		return result;
	}

}
