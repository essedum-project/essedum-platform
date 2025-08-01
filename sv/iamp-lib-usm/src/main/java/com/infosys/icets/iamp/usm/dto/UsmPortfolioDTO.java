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

package com.infosys.icets.iamp.usm.dto;
import java.io.Serializable;
import java.time.ZonedDateTime;

import lombok.Getter;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * A UsmPortfolio.
 */

/**
* @author icets
*/

/**
 * Gets the last updated.
 *
 * @return the last updated
 */

/**
 * Gets the last updated.
 *
 * @return the last updated
 */
@Getter

/**
 * Sets the last updated.
 *
 * @param lastUpdated the new last updated
 */

/**
 * Sets the last updated.
 *
 * @param lastUpdated the new last updated
 */
@Setter
public class UsmPortfolioDTO implements Serializable  {

    /** The id. */
    private Integer id;  
    
    /** The portfolio name. */
    private String portfolioName;  
    
    /** The description. */
    private String description;  
    
    /** The last updated. */
    private ZonedDateTime lastUpdated;
    
	

    
}

