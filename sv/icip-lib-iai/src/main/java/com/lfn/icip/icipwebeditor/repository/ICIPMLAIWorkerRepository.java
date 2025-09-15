package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorker;

import jakarta.transaction.Transactional;

@NoRepositoryBean
@Transactional
public interface ICIPMLAIWorkerRepository extends JpaRepository<ICIPMLAIWorker, Integer> {
	
	List<ICIPMLAIWorker> getAllAIWorkerByOrg(String project, Pageable paginate, String query);

	Long getAiWorkerCountByOrg(String project, String query);

	ICIPMLAIWorker findByNameAndOrganization(String name, String org);

	List<ICIPMLAIWorker> findByNameAndOrganizationAndTask(String name, String org, String task);

	ICIPMLAIWorker findByNameAndOrganizationAndTaskAndVersionname(String name, String org, String task,
			String versionname);

	void setDefaultVersionOfTask(String name, String org, String task);

	void deleteByNameAndOrganizationAndTaskAndVersionname(String name, String org, String task, String versionname);

	void deleteByNameAndOrganization(String name, String org);
}
