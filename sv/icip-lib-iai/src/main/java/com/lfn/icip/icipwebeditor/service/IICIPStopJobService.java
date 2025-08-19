package com.lfn.icip.icipwebeditor.service;
import com.lfn.ai.comm.lib.util.exceptions.LeapException;
import com.lfn.icip.icipwebeditor.model.ICIPJobsPartial;


public interface IICIPStopJobService {
	public ICIPJobsPartial stopPipelineJobs(ICIPJobsPartial job) throws LeapException;
}