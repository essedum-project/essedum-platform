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
package com.infosys.icets.icip.icipwebeditor.service;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import javax.sql.rowset.serial.SerialBlob;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.slf4j.Marker;

import com.infosys.icets.icip.icipwebeditor.model.ICIPNativeScript;

// TODO: Auto-generated Javadoc
// 
/**
 * The Interface IICIPNativeScriptService.
 *
 * @author icets
 */
public interface IICIPNativeScriptService {

	/**
	 * Find by name and org and file.
	 *
	 * @param name the name
	 * @param org  the org
	 * @return the ICIP native script
	 */
	ICIPNativeScript findByNameAndOrg(String name, String org);

	/**
	 * Delete by name and org.
	 *
	 * @param name the name
	 * @param org  the org
	 * @throws SQLException 
	 * @throws IOException 
	 * @throws GitAPIException 
	 * @throws TransportException 
	 * @throws InvalidRemoteException 
	 */
	void deleteByNameAndOrg(String name, String org) throws IOException, SQLException, InvalidRemoteException, TransportException, GitAPIException;

	/**
	 * Save.
	 *
	 * @param binaryFile the binary file
	 * @return the ICIP native script
	 */
	ICIPNativeScript save(ICIPNativeScript binaryFile);

	/**
	 * Copy.
	 *
	 * @param marker the marker
	 * @param fromProjectId the from project id
	 * @param toProjectId the to project id
	 * @return true, if successful
	 */
	boolean copy(Marker marker, String fromProjectId, String toProjectId);

	/**
	 * Delete.
	 *
	 * @param project the project
	 */
	void delete(String project);

	/**
	 * Update file.
	 *
	 * @param name     the name
	 * @param org      the org
	 * @param filename the filename
	 * @param file     the file
	 * @return the ICIP native script
	 */
	ICIPNativeScript updateFile(String name, String org, String filename, SerialBlob file);

	List<ICIPNativeScript> findByOrg(String org);
}
