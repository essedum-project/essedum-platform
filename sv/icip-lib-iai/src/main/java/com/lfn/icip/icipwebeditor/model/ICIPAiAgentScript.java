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

package com.lfn.icip.icipwebeditor.model;

import com.lfn.icip.icipwebeditor.constants.IAIJobConstants;
import com.lfn.icip.icipwebeditor.model.dto.ICIPAiAgentScriptDTO;
import com.lfn.icip.icipwebeditor.model.dto.ICIPNativeScriptDTO;
import jakarta.persistence.*;
import lombok.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.sql.Blob;
import java.sql.SQLException;
import java.time.Instant;

// TODO: Auto-generated Javadoc
// 

/**
 * The Class ICIPNativeScript.
 *
 * @author essedum
 */
//@EntityListeners(AuditListener.class)
@Entity
@Table(name = "mlpipelineaiagentscriptentity")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ICIPAiAgentScript implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The id. */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@EqualsAndHashCode.Include
	private Integer id;

	/** The cname. */
	private String cname;

	/** The organization. */
	private String organization;

	/** The filename. */
	private String filename;

	/** The file. */
	private Blob filescript;

    /** The filePath. */
    private String filePath;
	
	/**
	 * To DTO.
	 *
	 * @return the ICIP native script DTO
	 * @throws IOException Signals that an I/O exception has occurred.
	 * @throws SQLException the SQL exception
	 */
	public ICIPAiAgentScriptDTO toDTO() throws IOException, SQLException {
		StringBuilder strBuilder = new StringBuilder(4096);
		try (BufferedReader br = new BufferedReader(
				new InputStreamReader(filescript.getBinaryStream(), StandardCharsets.UTF_8), 2048)) {
			String line;
			while ((line = br.readLine()) != null) {
				strBuilder.append(line);
				strBuilder.append(System.getProperty(IAIJobConstants.LINE_SEPARATOR));
			}
		}
		return new ICIPAiAgentScriptDTO(id, cname, organization, filename, filePath, strBuilder.toString());
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
		ICIPAiAgentScript other = (ICIPAiAgentScript) obj;
		if (this.getId() == null) {
			if (other.getId() != null)
				return false;
		} else if (!id.equals(other.getId()))
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
		result = prime * result + ((this.getId() == null) ? 0 : id.hashCode());
		return result;
	}

}
