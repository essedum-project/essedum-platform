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

package com.lfn.icip.icipwebeditor.model.dto;

import java.sql.Timestamp;

// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPStreamingServices2DTO.
 */
public interface ICIPStreamingServices2DTO {
	
	/**
	 * Gets the cid.
	 *
	 * @return the cid
	 */
	Integer getCid();

	/**
	 *  The name.
	 *
	 * @return the name
	 */
	String getName();

	/**
	 *  The alias.
	 *
	 * @return the alias
	 */
	String getAlias();

	/**
	 *  The description.
	 *
	 * @return the description
	 */
	String getDescription();

	/**
	 *  The deleted.
	 *
	 * @return the deleted
	 */
	boolean getDeleted();

	/**
	 *  The type.
	 *
	 * @return the type
	 */
	String getType();
	/**
	 *  The Interfacetype.
	 *
	 * @return the Interfacetype
	 */
	String getInterfacetype(); 

	/**
	 *  The organization.
	 *
	 * @return the organization
	 */
	String getOrganization();

	/**
	 *  The created date.
	 *
	 * @return the created date
	 */
	Timestamp getCreatedDate();

}
