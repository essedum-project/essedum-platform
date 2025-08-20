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

package com.lfn.icip.dataset.model;

import java.io.Serializable;

import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


import org.hibernate.annotations.Cascade;

import com.lfn.ai.comm.lib.util.domain.BaseDomain;
import com.lfn.ai.comm.lib.util.listener.AuditListener;

import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
// TODO: Auto-generated Javadoc
// 

/**
 * The Class ICIPPartialDataset.
 *
 * @author essedum
 */
@MappedSuperclass
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mldataset", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "organization" }))

/**
 * Gets the backing dataset.
 *
 * @return the backing dataset
 */

/**
 * Gets the backing dataset.
 *
 * @return the backing dataset
 */

/**
 * Gets the backing dataset.
 *
 * @return the backing dataset
 */
@Getter
/**
 * Sets the backing dataset.
 *
 * @param backingDataset the new backing dataset
 */

/**
 * Sets the backing dataset.
 *
 * @param backingDataset the new backing dataset
 */

/**
 * Sets the backing dataset.
 *
 * @param backingDataset the new backing dataset
 */
@Setter
/**
 * Instantiates a new ICIP partial dataset.
 */

/**
 * Instantiates a new ICIP partial dataset.
 */

/**
 * Instantiates a new ICIP partial dataset.
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
public class ICIPPartialDataset extends BaseDomain implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The name. */
	private String name;

	/** The description. */
	private String description;

	/** The attributes. */
	private String attributes;

	/** The datasource. */
	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "datasource", referencedColumnName = "name")
	@JoinColumn(updatable = false, insertable = false, name = "organization", referencedColumnName = "organization")
	@Cascade(value = org.hibernate.annotations.CascadeType.SAVE_UPDATE)
	private ICIPDatasource datasource;

	/** The type. */
	private String type;

	/** The organization. */
	private String organization;


	/** The backing dataset. */
	@OneToOne
	@JoinColumn(updatable = false, insertable = false, name = "backing_dataset", referencedColumnName = "name")
	@JoinColumn(updatable = false, insertable = false, name = "organization", referencedColumnName = "organization")
	@Cascade(value = org.hibernate.annotations.CascadeType.SAVE_UPDATE)
	private ICIPDataset backingDataset;


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
		ICIPPartialDataset other = (ICIPPartialDataset) obj;
		if (this.getId() == null) {
			if (other.getId() != null)
				return false;
		} else if (!id.equals(other.getId()))
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
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		return result;
	}

}
