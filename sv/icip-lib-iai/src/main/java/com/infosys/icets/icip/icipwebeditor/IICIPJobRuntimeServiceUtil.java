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
package com.infosys.icets.icip.icipwebeditor;

import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.InvalidRemoteException;
import org.eclipse.jgit.api.errors.TransportException;
import org.json.JSONObject;
import org.quartz.InterruptableJob;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPNativeJobDetails;

// TODO: Auto-generated Javadoc
//
/**
 * The Interface IICIPJobRuntimeServiceUtil.
 *
 * @author icets
 */

public interface IICIPJobRuntimeServiceUtil extends InterruptableJob {

	JSONObject getJson();

	public String getNativeJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException, InvalidRemoteException, TransportException, GitAPIException;

	public String getDragAndDropJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException;

	public String getBinaryJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException;

	public String getAzureJobCommand(ICIPNativeJobDetails jobDetails) throws LeapException;

}
