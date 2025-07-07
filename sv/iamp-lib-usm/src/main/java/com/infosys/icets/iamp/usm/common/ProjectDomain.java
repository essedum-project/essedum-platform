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
package com.infosys.icets.iamp.usm.common;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * The Class ProjectDomain.
 *
 * @author icets
 */
/**
 * Gets the value.
 *
 * @return the value
 */

/**
 * Gets the project id.
 *
 * @return the project id
 */

/**
 * Gets the project id.
 *
 * @return the project id
 */
@Getter

/**
 * Sets the value.
 *
 * @param value the new value
 */

/**
 * Sets the project id.
 *
 * @param projectId the new project id
 */

/**
 * Sets the project id.
 *
 * @param projectId the new project id
 */
@Setter
@MappedSuperclass
public class ProjectDomain implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The project id. */
	@Column(name = "project_id")
	private Integer projectId;

}
