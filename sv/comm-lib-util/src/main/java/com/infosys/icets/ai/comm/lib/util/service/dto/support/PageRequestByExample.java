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
package com.infosys.icets.ai.comm.lib.util.service.dto.support;

import java.io.Serializable;

import org.springframework.data.domain.Pageable;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 
/**
 * The Class PageRequestByExample.
 *
 * @author icets
 * @param <T> the generic type
 */

/**
 * Gets the lazy load event.
 *
 * @return the lazy load event
 */
@Getter

/**
 * Sets the lazy load event.
 *
 * @param lazyLoadEvent the new lazy load event
 */
@Setter

/**
 * Instantiates a new page request by example.
 *
 * @param example the example
 * @param lazyLoadEvent the lazy load event
 */
@AllArgsConstructor

/**
 * Instantiates a new page request by example.
 */
@NoArgsConstructor
public class PageRequestByExample<T> implements Serializable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	/** The example. */
	private T example;
	
	/** The lazy load event. */
	private LazyLoadEvent lazyLoadEvent;

	/**
	 * To pageable.
	 *
	 * @return the pageable
	 */
	public Pageable toPageable() {
		return lazyLoadEvent != null ? lazyLoadEvent.toPageable() : null;
	}
}