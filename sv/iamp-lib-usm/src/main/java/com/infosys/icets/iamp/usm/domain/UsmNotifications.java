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
package com.infosys.icets.iamp.usm.domain;

import java.io.Serializable;
import java.time.ZonedDateTime;
import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * The Class UsmNotifications.
 *
 * @author iCets
 */
/**
 * @author icets
 */
@Entity
@Table(name = "usm_notifications")

/**
 * Gets the read flag.
 *
 * @return the read flag
 */

/**
 * Gets the read flag.
 *
 * @return the read flag
 */
@Getter

/**
 * Sets the read flag.
 *
 * @param readFlag the new read flag
 */

/**
 * Sets the read flag.
 *
 * @param readFlag the new read flag
 */
@Setter
/*
 * (non-Javadoc)
 * 
 * @see java.lang.Object#toString()
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UsmNotifications implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The user id. */
	@Size(max = 120)
	@Column(name = "user_id")
	private String userId;

	/** The severity. */
	@Size(max = 56)
	private String severity;

	/** The source. */
	@Size(max = 256)
	private String source;

	/** The message. */
	@Size(max = 65535)
	@Column(columnDefinition = "TEXT")
	private String message;

	/** The date time. */
	@Column(name = "date_time")
	private ZonedDateTime dateTime;

	/** The read flag. */
	@Column(name = "read_flag")
	private Boolean readFlag;

	@Column(name = "role_id")
	private Integer roleId;
	@Column(name = "action_link")
	private String actionLink;
	@Column(name = "raised_by")
	private Integer raisedBy;
	@Column(name = "action_type")
	private String actionType;
	@Column(name = "entity_type")
	private String entityType;
	@Column(name = "entity_id")
	private Integer entityId;
}
