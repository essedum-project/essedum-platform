package com.lfn.icip.icipwebeditor.repository;


import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.icipwebeditor.model.ICIPMLAIWorkerConfig;

import jakarta.transaction.Transactional;

@NoRepositoryBean
@Transactional
public interface ICIPMLAIWorkerConfigRepository extends JpaRepository<ICIPMLAIWorkerConfig, Integer> {
	
	List<ICIPMLAIWorkerConfig> getAllAIWorkerConfigByOrg(String project, Pageable paginate, String query);

	Long getAiWorkerConfigCountByOrg(String project, String query);

	ICIPMLAIWorkerConfig findByNameAndOrganization(String name, String org);
	
	ICIPMLAIWorkerConfig findByAliasAndOrganization(String alias, String org);

	List<ICIPMLAIWorkerConfig> findByOrganization(String organization);
	
	List<String> getDistinctToolByWorkerAndOrg(List<String> workerName, String organization);
	
}
