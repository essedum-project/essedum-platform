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
package com.infosys.icets.icip.icipwebeditor.repository.postgresql;

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

import com.infosys.icets.icip.icipwebeditor.model.ICIPNativeScript;
import com.infosys.icets.icip.icipwebeditor.repository.ICIPNativeScriptRepository;
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
