package com.infosys.icets.icip.icipwebeditor.service;
import org.json.JSONObject;

import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;


public interface IICIPOutputArtifactsService {
	public JSONObject findOutputArtifacts(ICIPJobsPartial job) throws LeapException;
}