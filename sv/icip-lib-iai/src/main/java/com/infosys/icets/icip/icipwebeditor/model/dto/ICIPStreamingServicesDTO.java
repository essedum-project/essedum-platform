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

import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.infosys.icets.ai.comm.lib.util.domain.BaseDomain;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPStreamingServicesDTO.
 *
 * @author icets
 */

/**
 * Gets the last modified date.
 *
 * @return the last modified date
 */

/**
 * Gets the last modified date.
 *
 * @return the last modified date
 */

/**
 * Gets the created date.
 *
 * @return the created date
 */
@Getter

/**
 * Sets the last modified date.
 *
 * @param lastModifiedDate the new last modified date
 */

/**
 * Sets the last modified date.
 *
 * @param lastModifiedDate the new last modified date
 */

/**
 * Sets the created date.
 *
 * @param createdDate the new created date
 */
@Setter

/**
 * Instantiates a new ICIP streaming services DTO.
 */

/**
 * Instantiates a new ICIP streaming services DTO.
 */

/**
 * Instantiates a new ICIP streaming services DTO.
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
public class ICIPStreamingServicesDTO extends BaseDomain{

	/** The cid. */
	@EqualsAndHashCode.Include
	private Integer cid;

	/** The name. */
	private String name;

	private String alias;
	/** The description. */
	private String description;

	/** The job id. */
	@JsonAlias({ "job_id" })
	private String jobId;

	/** The version. */
	private Integer version;

	/** The json content. */
	@JsonAlias({ "json_content" })
	private String jsonContent;

	/** The type. */
	private String type;

	/** The organization. */
	private String organization;
	
	private String tags;
	private String interfacetype;
	/** The created by. */
	@JsonAlias({ "created_by" })
	private String createdBy;

	/** The created date. */
	@JsonAlias({ "created_date" })
	private Timestamp createdDate = new Timestamp(System.currentTimeMillis());
	
	@JsonAlias({ "is_template" })
	private boolean isTemplate;
	
	@JsonAlias({ "is_app" })
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
		ICIPStreamingServicesDTO other = (ICIPStreamingServicesDTO) obj;
		if (cid == null) {
			if (other.cid != null)
				return false;
		} else if (!cid.equals(other.cid))
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
		result = prime * result + ((cid == null) ? 0 : cid.hashCode());
		return result;
	}

}
