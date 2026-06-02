package com.lfn.icip.icipwebeditor.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.icipwebeditor.model.ICIPMLTools;

import jakarta.transaction.Transactional;

@NoRepositoryBean
@Transactional
public interface ICIPMLToolsRepository extends JpaRepository<ICIPMLTools, Integer> {
	
	List<ICIPMLTools> getAllMltoolsByOrg(String project, Pageable paginate, String query);

	Long getMltoolCountByOrg(String project, String query);

	ICIPMLTools findMltoolByNameAndOrganization(String name, String org);

	List<ICIPMLTools> findMltoolsByNameAndOrganization(String name, String org);

	List<ICIPMLTools> checkAlias(String alias, String project);

	void deleteByNameAndOrganization(String name, String org);

	List<ICIPMLTools> findByOrganization(String org);

}
