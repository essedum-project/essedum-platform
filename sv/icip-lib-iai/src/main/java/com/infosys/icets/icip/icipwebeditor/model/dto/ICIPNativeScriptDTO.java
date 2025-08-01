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

package com.infosys.icets.icip.icipwebeditor.model.dto;

import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.sql.SQLException;

import javax.sql.rowset.serial.SerialBlob;
import javax.sql.rowset.serial.SerialException;

import com.infosys.icets.icip.icipwebeditor.model.ICIPNativeScript;

import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// TODO: Auto-generated Javadoc
/**
 * Gets the filescript.
 *
 * @return the filescript
 */
@Getter

/**
 * Sets the file.
 *
 * @param file the new file
 */

/**
 * Sets the filescript.
 *
 * @param filescript the new filescript
 */

/**
 * Sets the filescript.
 *
 * @param filescript the new filescript
 */
@Setter

/**
 * Instantiates a new ICIP native script.
 */

/**
 * Instantiates a new ICIP native script.
 */

/**
 * Instantiates a new ICIP native script DTO.
 */
@NoArgsConstructor

/**
 * Instantiates a new ICIP native script.
 *
 * @param id           the id
 * @param cname        the cname
 * @param organization the organization
 * @param filename     the filename
 * @param file         the file
 */

/**
 * Instantiates a new ICIP native script.
 *
 * @param id           the id
 * @param cname        the cname
 * @param organization the organization
 * @param filename     the filename
 * @param filescript   the filescript
 */

/**
 * Instantiates a new ICIP native script DTO.
 *
 * @param id the id
 * @param cname the cname
 * @param organization the organization
 * @param filename the filename
 * @param filescript the filescript
 */
@AllArgsConstructor

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
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class ICIPNativeScriptDTO implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@EqualsAndHashCode.Include
	private Integer id;

	/** The cname. */
	private String cname;

	/** The organization. */
	private String organization;

	/** The filename. */
	private String filename;

	/** The file. */
	private String filescript;

	/**
	 * To entity.
	 *
	 * @return the ICIP native script
	 * @throws SerialException the serial exception
	 * @throws SQLException the SQL exception
	 */
	public ICIPNativeScript toEntity() throws SerialException, SQLException {
		return new ICIPNativeScript(id, cname, organization, filename,  new SerialBlob(filescript.getBytes(StandardCharsets.UTF_8)));
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
		ICIPNativeScriptDTO other = (ICIPNativeScriptDTO) obj;
		if (id == null) {
			if (other.id != null)
				return false;
		} else if (!id.equals(other.id))
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
		result = prime * result + ((id == null) ? 0 : id.hashCode());
		return result;
	}

}
