package com.infosys.icets.icip.icipwebeditor.service;

import java.util.List;

import org.json.JSONObject;
import org.springframework.data.domain.Pageable;

import com.infosys.icets.icip.icipwebeditor.model.ICIPMLAIWorkerLogs;

public interface ICIPMLAIWorkerLogsService {

	Long logsCountByOrganization(String org);

	Long logsCountByTaskAndOrganization(String task, String org);

	ICIPMLAIWorkerLogs saveLog(String project, JSONObject reqBody);

}
