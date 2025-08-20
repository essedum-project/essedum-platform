package com.lfn.icip.dataset.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import com.lfn.icip.dataset.model.ICIPDatasetTopic;

/**
 * Spring Data JPA repository for the ICIPDatasetTopic entity.

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPDatasetTopic;

/**
 * Spring Data JPA repository for the MlInstance entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPDatasetTopicRepository extends JpaRepository<ICIPDatasetTopic, Integer> {
	public List<ICIPDatasetTopic> getByOrganization(String org);
	
	public List<ICIPDatasetTopic> findByDatasetidAndOrganization(String datasetid,String org);
	
	public ICIPDatasetTopic findByDatasetidAndTopicnameAndOrganization(String datasetid,String topicname,String org);
	
	@Query(value ="SELECT * FROM mldatasettopics WHERE topicname = :topicname AND organization = :org",nativeQuery =true)
	
	public List<ICIPDatasetTopic> findByTopicnameAndOrganization(String topicname, String org);
}
