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
package com.infosys.icets.icip.dataset.model;

import java.io.Serializable;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


import com.infosys.icets.ai.comm.lib.util.listener.AuditListener;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The Class ICIPSpecTemplate.
 *
 * @author icets
 */
//@MappedSuperclass
@EntityListeners(AuditListener.class)
@Entity
@Table(name = "spectemplates", uniqueConstraints = @UniqueConstraint(columnNames = { "templateName" }))
@Getter
@Setter
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
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)

/**
 * Instantiates a new ICIPSpecTemplate.
 *
 * @param templateName the templateName
 * @param template     the template
 */
@AllArgsConstructor
public class ICIPSpecTemplate implements Serializable, Cloneable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The templateName. */
	@Id
	@EqualsAndHashCode.Include
	private String templateName;

	/** The template. */
	private String template;

	/**
	 * Clone.
	 *
	 * @return the ICIPSpecTemplate
	 */
	public ICIPSpecTemplate clone() {
		ICIPSpecTemplate tm = new ICIPSpecTemplate(templateName, template);
		tm.setTemplateName(templateName);
		tm.setTemplate(template);
		return tm;
	}

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
		ICIPSpecTemplate other = (ICIPSpecTemplate) obj;
		if (this.getTemplateName() == null) {
			if (other.getTemplateName() != null)
				return false;
		} else if (!templateName.equals(other.getTemplateName()))
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
		result = prime * result + ((this.getTemplateName() == null) ? 0 : templateName.hashCode());
		return result;
	}

}
