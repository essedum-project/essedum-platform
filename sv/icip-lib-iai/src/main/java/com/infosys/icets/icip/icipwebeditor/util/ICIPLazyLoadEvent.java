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
