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
