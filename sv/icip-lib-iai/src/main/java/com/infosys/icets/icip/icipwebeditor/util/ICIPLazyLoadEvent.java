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

package com.infosys.icets.icip.icipwebeditor.util;

import java.io.Serializable;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPLazyLoadEvent.
 *
 * @author icets
 */

/**
 * Gets the sort order.
 *
 * @return the sort order
 */

/**
 * Gets the multi sort meta.
 *
 * @return the multi sort meta
 */

/**
 * Gets the multi sort meta.
 *
 * @return the multi sort meta
 */
@Getter 
 /**
  * Sets the sort order.
  *
  * @param sortOrder the new sort order
  */
 
 /**
  * Sets the multi sort meta.
  *
  * @param multiSortMeta the new multi sort meta
  */
 
 /**
  * Sets the multi sort meta.
  *
  * @param multiSortMeta the new multi sort meta
  */
 @Setter 
 /**
  * Instantiates a new ICIP lazy load event.
  *
  * @param first the first
  * @param rows the rows
  * @param sortField the sort field
  * @param sortOrder the sort order
  */
 
 /**
  * Instantiates a new ICIP lazy load event.
  *
  * @param first the first
  * @param rows the rows
  * @param sortField the sort field
  * @param sortOrder the sort order
  * @param filters the filters
  * @param multiSortMeta the multi sort meta
  */
 
 /**
  * Instantiates a new ICIP lazy load event.
  *
  * @param first the first
  * @param rows the rows
  * @param sortField the sort field
  * @param sortOrder the sort order
  * @param filters the filters
  * @param multiSortMeta the multi sort meta
  */
 @AllArgsConstructor 
 /**
  * Instantiates a new ICIP lazy load event.
  */
 
 /**
  * Instantiates a new ICIP lazy load event.
  */
 
 /**
  * Instantiates a new ICIP lazy load event.
  */
 @NoArgsConstructor
public class ICIPLazyLoadEvent implements Serializable{
    
    /** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/**
     * First row offset.
     */
    private int first;

    /**
     * Number of rows per page.
     */
    private int rows;

    /** The sort field. */
    private String sortField;
    
    /** The sort order. */
    private int sortOrder;
    
    /** The filters. */
    private String filters;
    
    /** The multiSortMeta. */
    private String multiSortMeta;

    /**
     * To pageable.
     *
     * @return the pageable
     */
    public Pageable toPageable() {
        if (sortField != null) {
        	
            return PageRequest.of(toPageIndex(), rows, toSortDirection(), sortField);
        } else {
            return PageRequest.of(toPageIndex(), rows);
        }
    }

    /**
     * Zero based page index.
     *
     * @return the int
     */
    public int toPageIndex() {
    	if(rows<1) 
    		rows = 2;
        return (first + rows) / rows - 1;
    }

    /**
     * To sort direction.
     *
     * @return the sort. direction
     */
    public Sort.Direction toSortDirection() {
        return sortOrder == 1 ? Sort.Direction.ASC : Sort.Direction.DESC;
    }
}
