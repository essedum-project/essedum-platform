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
import java.util.List;

import lombok.Getter;
import lombok.Setter;

// 
/**
 * The Class PageResponse.
 *
 * @author icets
 * @param <T> the generic type
 */

/**
 * Gets the content.
 *
 * @return the content
 */
@Getter 
 /**
  * Sets the content.
  *
  * @param content the new content
  */
 @Setter 
public class PageResponse<T extends Serializable> implements Serializable{
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;
	
	/** The total pages. */
	private int totalPages;
    
    /** The total elements. */
    private long totalElements;    
    
    /** The content. */
    private List<T> content;

    /**
     * Instantiates a new page response.
     *
     * @param totalPages the total pages
     * @param totalElements the total elements
     * @param content the content
     */
    public PageResponse(int totalPages, long totalElements, List<T> content) {
        this.totalPages = totalPages;
        this.totalElements = totalElements;
        this.content = content;
    }
}
