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
package com.infosys.icets.icip.icipwebeditor.util;

import java.io.Serializable;
import java.util.List;

import lombok.Data;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPPageResponse.
 *
 * @param <T> the generic type
 * @author icets
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */

/**
 * To string.
 *
 * @return the java.lang. string
 */
@Data
public class ICIPPageResponse<T> implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The total pages. */
	private final int totalPages;

	/** The total elements. */
	private final long totalElements;

	/** The content. */
	private final List<T> content;

	/**
	 * Instantiates a new ICIP page response.
	 *
	 * @param totalPages    the total pages
	 * @param totalElements the total elements
	 * @param content       the content
	 */
	public ICIPPageResponse(int totalPages, long totalElements, List<T> content) {
		this.totalPages = totalPages;
		this.totalElements = totalElements;
		this.content = content;
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
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ICIPPageResponse other = (ICIPPageResponse) obj;
		if (content == null) {
			if (other.content != null)
				return false;
		} else if (!content.equals(other.content))
			return false;
		if (totalElements != other.totalElements)
			return false;
		if (totalPages != other.totalPages)
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
		int result = 1;
		result = prime * result + ((content == null) ? 0 : content.hashCode());
		result = prime * result + (int) (totalElements ^ (totalElements >>> 32));
		result = prime * result + totalPages;
		return result;
	}
}
