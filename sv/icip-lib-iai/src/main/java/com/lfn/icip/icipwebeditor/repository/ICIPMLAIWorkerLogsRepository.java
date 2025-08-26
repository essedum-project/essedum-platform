package com.lfn.icip.icipwebeditor.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerLogs;

import jakarta.transaction.Transactional;

@NoRepositoryBean
@Transactional
public interface ICIPMLAIWorkerLogsRepository extends JpaRepository<ICIPMLAIWorkerLogs, Integer> {

	Long countByOrganization(String org);

	Long countByTaskAndOrganization(String task, String org);

}
