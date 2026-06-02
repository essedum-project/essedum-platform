package com.lfn.icip.dataset.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import com.lfn.icip.dataset.model.ICIPTopic;

/**
 * Spring Data JPA repository for the ICIPTopic entity.
 */
/**
 * @author essedum
 */
@NoRepositoryBean
public interface ICIPTopicRepository extends JpaRepository<ICIPTopic, Integer> {

	public List<ICIPTopic> findByOrganization(String org);

	public ICIPTopic findByTopicnameAndOrganization(String topicname, String org);

	public List<ICIPTopic> activeMltopicsByOrg(String org);
}
