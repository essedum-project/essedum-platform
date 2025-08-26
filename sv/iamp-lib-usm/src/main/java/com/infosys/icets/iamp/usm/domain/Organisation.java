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
import java.time.LocalDate;
import lombok.EqualsAndHashCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

// TODO: Auto-generated Javadoc
/**
 * A Organisation.
 */
/**
* @author icets
*/

/**
 * Gets the context.
 *
 * @return the context
 */

/**
 * Gets the context.
 *
 * @return the context
 */
@Getter

/**
 * Sets the context.
 *
 * @param context the new context
 */

/**
 * Sets the context.
 *
 * @param context the new context
 */
@Setter
@Entity

/**
 * To string.
 *
 * @return the java.lang. string
 */
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
// @JsonIdentityInfo(generator=ObjectIdGenerators.PropertyGenerator.class,
// property="id", scope=Organisation.class)
@Table(name = "usm_organisation")
public class Organisation implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@EqualsAndHashCode.Include
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

	/** The name. */
	@NotNull
	@Size(max = 100)
	private String name;

	/** The location. */
	@Size(max = 1500)
	private String location;

	/** The division. */
	@Size(max = 1500)
	private String division;

	/** The country. */
	@Size(max = 1500)
	@Column(name = "country")
	private String country;

	/** The decription. */
	@Size(max = 1500)
	private String decription;

	/** The onboarded. */
	private Boolean onboarded;

	/** The status. */
	@Size(max = 100)
	private String status;

	/** The createdby. */
	@Size(max = 100)
	@Column(name = "created_by")
	private String createdby;

	/** The createddate. */
	@Column(name = "created_date")
	private LocalDate createddate;

	/** The modifiedby. */
	@Size(max = 100)
	@Column(name = "modified_by")
	private String modifiedby;

	/** The modifieddate. */
	@Column(name = "modified_date")
	private LocalDate modifieddate;

	/** The context. */
	@JoinColumn(name = "context")
	@ManyToOne
	private Context context;	

}
