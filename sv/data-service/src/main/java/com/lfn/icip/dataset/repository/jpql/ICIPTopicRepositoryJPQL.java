package com.lfn.icip.dataset.repository.jpql;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.lfn.icip.dataset.model.ICIPTopic;
import com.lfn.icip.dataset.repository.ICIPTopicRepository;

@Repository
public interface ICIPTopicRepositoryJPQL extends ICIPTopicRepository {

	@Query("Select topics from ICIPTopic topics where topics.organization = ?1")
	public List<ICIPTopic> findByOrganization(String org);

	@Query("Select topics from ICIPTopic topics where topics.topicname = ?1 and topics.organization = ?2")
	public ICIPTopic findByTopicnameAndOrganization(String topicname, String org);

	@Query("Select topics from ICIPTopic topics inner join ICIPDatasetTopic dstopics on topics.topicname=dstopics.topicname.topicname where topics.organization = ?1 and dstopics.organization = ?1 and dstopics.status='COMPLETED'")
	public List<ICIPTopic> activeMltopicsByOrg(String org);

}
