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

import com.google.gson.JsonArray;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
// 
/**
 * The Class ICIPSchemaDetails.
 *
 * @author essedum
 */

/**
 * Gets the schema details.
 *
 * @return the schema details
 */

/**
 * Gets the schema details.
 *
 * @return the schema details
 */

/**
 * Gets the schema details.
 *
 * @return the schema details
 */
@Getter 
 /**
  * Sets the schema details.
  *
  * @param schemaDetails the new schema details
  */
 
 /**
  * Sets the schema details.
  *
  * @param schemaDetails the new schema details
  */
 
 /**
  * Sets the schema details.
  *
  * @param schemaDetails the new schema details
  */
 @Setter 
 /**
  * Instantiates a new ICIP schema details.
  */
 
 /**
  * Instantiates a new ICIP schema details.
  */
 
 /**
  * Instantiates a new ICIP schema details.
  */
 @MappedSuperclass
 @NoArgsConstructor
public class ICIPSchemaDetails implements Serializable{
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 6971033789732367872L;
	
	/** The schema id. */
	private String schemaId;
	
	/** The schema details. */
	private JsonArray schemaDetails;
}
