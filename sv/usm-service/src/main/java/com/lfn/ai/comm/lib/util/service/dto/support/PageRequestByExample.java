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

package com.lfn.ai.comm.lib.util.service.dto.support;

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
 * @author essedum
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