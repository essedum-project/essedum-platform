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

package com.infosys.icets.icip.icipwebeditor.model;

import java.io.Serializable;
import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedNativeQueries;
import jakarta.persistence.NamedNativeQuery;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Null;

import org.hibernate.annotations.NaturalId;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;
import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class ICIPStreamingServices.
 */
// 
/**
 * The Class ICIPStreamingServices.
 *
 * @author icets
 */
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlpipeline", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "organization" }))

/**
 * Gets the created date.
 *
 * @return the created date
 */
@Getter

/**
 * Sets the created date.
 *
 * @param createdDate the new created date
 */
@Setter

/**
 * Instantiates a new ICIP streaming services.
 */
@NoArgsConstructor

/**
 * Instantiates a new ICIP streaming services.
 *
 * @param cid the cid
 * @param name the name
 * @param description the description
 * @param jobId the job id
 * @param version the version
 * @param jsonContent the json content
 * @param type the type
 * @param organization the organization
 * @param deleted the deleted
 * @param createdBy the created by
 * @param createdDate the created date
 */
@AllArgsConstructor

/**
 * Hash code.
 *
 * @return the int
 */
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class ICIPStreamingServices extends BaseDomain implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The cid. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer cid;

	/** The name. */
	@NaturalId
	private String name;

	/** The description. */
	private String description;
	
	private String tags;

	/** The job id. */
	@Column(name = "job_id")
	@JsonProperty("job_id")
	private String jobId;

	/** The version. */
	@Column(columnDefinition = "integer default 0")
	private Integer version;

	/** The json content. */
	@Column(name = "json_content")
	@JsonProperty("json_content")
	private String jsonContent;

	/** The type. */
	private String type;
	private String interfacetype;
	
	@Column(name = "is_template", nullable = false)
	@JsonProperty("is_template")
	private boolean isTemplate;
	/** The organization. */
	private String organization;

	/** The deleted. */
	private boolean deleted;
	

	/** The created by. */
	@Column(name = "created_by", nullable = false, length = 50, updatable = false)
	@JsonProperty("created_by")
	private String createdBy;

	/** The created date. */
	@Column(name = "created_date", updatable = false)
	@JsonProperty("created_date")
	private Timestamp createdDate = new Timestamp(System.currentTimeMillis());
	
	@Column(name = "pipeline_metadata")
	private String pipelineMetadata;
	
	@Column(name="is_app")
	@JsonProperty("is_app")
	private boolean isApp;
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
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPStreamingServices other = (ICIPStreamingServices) obj;
		if (this.getCid() == null) {
			if (other.getCid() != null)
				return false;
		} else if (!cid.equals(other.getCid()))
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
		int result = super.hashCode();
		result = prime * result + ((this.getCid() == null) ? 0 : cid.hashCode());
		return result;
	}

}
