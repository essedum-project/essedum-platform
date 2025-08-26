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

package com.lfn.icip.icipmodelserver.model;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Objects;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.lfn.ai.comm.lib.util.domain.BaseDomain;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

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
