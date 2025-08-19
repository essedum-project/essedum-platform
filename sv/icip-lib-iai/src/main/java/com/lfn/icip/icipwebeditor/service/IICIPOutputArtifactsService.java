package com.lfn.icip.icipwebeditor.service;
import org.json.JSONObject;

import com.lfn.ai.comm.lib.util.exceptions.LeapException;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;


public interface IICIPOutputArtifactsService {
	public JSONObject findOutputArtifacts(ICIPJobsPartial job) throws LeapException;
}