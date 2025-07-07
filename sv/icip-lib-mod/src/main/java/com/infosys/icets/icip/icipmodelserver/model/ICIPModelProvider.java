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
import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.Data;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPModelServers.
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlmodelprovider")

/**
 * Instantiates a new ICIP model providers.
 */

/**
 * Instantiates a new ICIP model servers.
 */
@Data
public class ICIPModelProvider extends BaseDomain implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	private String name;

	private String type;

	/** The connection details. */
	private String connectionDetails;
	
	/** The organization. */
	private String organization;

	
	@Override
	public boolean equals(Object obj) {
	    if (this == obj)
	        return true;
	    if (!super.equals(obj))
	        return false;
	    if (getClass() != obj.getClass())
	        return false;
	    ICIPModelProvider other = (ICIPModelProvider) obj;
	    return Objects.equals(getId(), other.getId()) && Objects.equals(getName(), other.getName())
	            && Objects.equals(getOrganization(), other.getOrganization()) && Objects.equals(getType(), other.getType());
	}

	@Override
	public int hashCode() {
	    final int prime = 31;
	    int result = super.hashCode();
	    result = prime * result + Objects.hash(getId(), getName(), getOrganization(), getType());
	    return result;
	}

	
}
