package com.lfn.icip.icipwebeditor.service.impl;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.service.dto.support.NameEncoderService;
import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerLogs;
import com.lfn.icip.icipwebeditor.repository.ICIPMLAIWorkerLogsRepository;
import com.lfn.icip.icipwebeditor.service.ICIPMLAIWorkerLogsService;

@Service
public class ICIPMLAIWorkerLogsServiceImpl implements ICIPMLAIWorkerLogsService{
	
	@Autowired
	ICIPMLAIWorkerLogsRepository aiWorkerLogsRepo;

	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	@Override
	public Long logsCountByOrganization(String org) {
		return aiWorkerLogsRepo.countByOrganization(org);
	}

	@Override
	public Long logsCountByTaskAndOrganization(String task, String org) {
		return aiWorkerLogsRepo.countByTaskAndOrganization(task, org);

	}

	@Override
	public ICIPMLAIWorkerLogs saveLog(String org, JSONObject body) {
		ICIPMLAIWorkerLogs log = new ICIPMLAIWorkerLogs();
		
		log.setSubmittedBy(ICIPUtils.getUser(claim));
		log.setSubmittedOn(Timestamp.from(Instant.now()));
		log.setTask(body.getString("task"));
		log.setWorker(body.getString("worker"));
		log.setRuntime(body.getString("runtime"));
		log.setRuntimeDsrc(body.getString("runtimeDsrc"));
		log.setContext(body.getString("context"));
		log.setOrganization(org);
		log.setJobStatus("Running");
		if(body.optString("Uid").isEmpty()) {
			log.setUid(this.generateNumericiId());
		}else {
			log.setUid(body.getString("Uid"));
		}
		
		return aiWorkerLogsRepo.save(log);
		
	}
	
	private String generateNumericiId() {
	    long timestamp = System.currentTimeMillis();
	    long uuidPart = UUID.randomUUID().getMostSignificantBits();
	    long correlationId = timestamp ^ uuidPart;
	    return ""+Math.abs(correlationId); 
	}

}
