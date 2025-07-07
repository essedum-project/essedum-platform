package com.infosys.icets.icip.icipwebeditor.service;
import com.infosys.icets.ai.comm.lib.util.exceptions.LeapException;
import com.infosys.icets.icip.icipwebeditor.model.ICIPJobsPartial;


public interface IICIPStopJobService {
	public ICIPJobsPartial stopPipelineJobs(ICIPJobsPartial job) throws LeapException;
}