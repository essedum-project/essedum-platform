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

package com.lfn.icip.icipwebeditor.repository.postgresql;

import java.sql.Blob;
import java.sql.SQLException;

import javax.sql.rowset.serial.SerialBlob;
import javax.sql.rowset.serial.SerialException;
import jakarta.transaction.Transactional;

import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.icipwebeditor.model.ICIPNativeScript;
import com.lfn.icip.icipwebeditor.repository.ICIPNativeScriptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
// TODO: Auto-generated Javadoc
/**
 * The Interface ICIPNativeScriptRepositorypostgresql.
 */
@Profile("postgresql")
@Repository
@Transactional
public interface ICIPNativeScriptRepositoryPOSTGRESQL extends ICIPNativeScriptRepository {
	 static final Logger logger = LoggerFactory.getLogger(ICIPNativeScriptRepositoryPOSTGRESQL.class);

	/**
	 * Delete by project.
	 *
	 * @param org the org
	 */
	@Modifying
	@Query(value = "delete from mlpipelinenativescriptentity where organization = :org", nativeQuery = true)
	void deleteByProject(@Param("org") String org);
	
	@Modifying
	@Query(value = "delete from mlpipelinenativescriptentity where cname = :cname and organization = :org", nativeQuery = true)
	void deleteByCnameAndOrg(@Param("cname") String cname, @Param("org") String org);

	@Override
	default ICIPNativeScript customSave(ICIPNativeScript nativeScript) {
		Blob filescript = nativeScript.getFilescript();
		savewithoutfilescript(nativeScript.getCname(),nativeScript.getOrganization(),nativeScript.getFilename());		
		try {
			setFileScript(filescript.getBytes(1, (int) filescript.length()), nativeScript.getCname());
		} catch (SQLException e) {
			logger.error(e.getMessage());
		}
		return nativeScript;
	}

	@Modifying
	@Query(value = "INSERT INTO mlpipelinenativescriptentity (cname, organization,filename) "
			+ "VALUES(:cname,:org,:filename) ON CONFLICT (cname) "
			+ "DO UPDATE SET filename = :filename", nativeQuery = true)
	Integer savewithoutfilescript(@Param("cname") String cname,@Param("org") String org, @Param("filename") String filename);
	
	@Modifying
	@Query(value = "update mlpipelinenativescriptentity set filescript = :filescript where cname = :cname", nativeQuery = true)
	Integer setFileScript(@Param("filescript") byte[] filescript,@Param("cname") String cname);
	
	@Override
	default ICIPNativeScript findByCnameAndOrganization(String cname, String org) {
		ICIPNativeScript nativescript = new ICIPNativeScript();
		nativescript.setFilename(getNativeScriptWithoutScript(cname));
		try {
			if(getFileScript(cname)!=null) {
				nativescript.setFilescript(new SerialBlob(getFileScript(cname)));	
				nativescript.setCname(cname);
				nativescript.setOrganization(org);
			}
		} catch (SerialException e) {
			logger.error(e.getMessage());
		} catch (SQLException e) {
			logger.error(e.getMessage());
		}
		return nativescript;
	}
	
	@Query(value = "select filescript from mlpipelinenativescriptentity where cname = :cname", nativeQuery = true)
	byte[] getFileScript(@Param("cname") String cname);
	

	@Query(value = "select fileName from mlpipelinenativescriptentity where cname = :cname", nativeQuery = true)
	String getNativeScriptWithoutScript(@Param("cname") String cname);
}
