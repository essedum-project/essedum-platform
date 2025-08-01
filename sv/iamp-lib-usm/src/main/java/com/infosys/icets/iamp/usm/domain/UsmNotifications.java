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
