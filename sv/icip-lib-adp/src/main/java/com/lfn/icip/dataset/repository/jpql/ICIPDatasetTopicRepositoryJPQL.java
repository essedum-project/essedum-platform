package com.lfn.icip.dataset.repository.jpql;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.lfn.icip.dataset.model.ICIPDatasetTopic;
import com.lfn.icip.dataset.repository.ICIPDatasetTopicRepository;
@Repository
public interface ICIPDatasetTopicRepositoryJPQL extends ICIPDatasetTopicRepository {
	@Query("Select dstopic from ICIPDatasetTopic dstopic where dstopic.organization = ?1")
	public List<ICIPDatasetTopic> getByOrganization(String org);
	
	@Query("Select dstopic from ICIPDatasetTopic dstopic where dstopic.datasetid = ?1 and dstopic.organization = ?2")
	public List<ICIPDatasetTopic> findByDatasetidAndOrganization(String datasetid,String org);
		
	@Query("Select dstopic from ICIPDatasetTopic dstopic where dstopic.datasetid = ?1 and dstopic.topicname.topicname= ?2 and dstopic.organization = ?3")
	public ICIPDatasetTopic findByDatasetidAndTopicnameAndOrganization(String datasetid,String topicname,String org);
	
	@Query("Select dstopic from ICIPDatasetTopic dstopic where dstopic.topicname.topicname= ?1 and dstopic.organization = ?2")
	public List<ICIPDatasetTopic> findByTopicnameAndOrganization(String topicname, String org);
}
