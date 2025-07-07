package com.infosys.icets.icip.icipwebeditor.repository;


import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.infosys.icets.icip.icipwebeditor.model.ICIPPrompts;

import jakarta.transaction.Transactional;

@NoRepositoryBean
@Transactional
public interface ICIPPrompRepository extends JpaRepository<ICIPPrompts, Integer> {

	
	Long countByName(String name);

	List<ICIPPrompts> getAllPromptsByOrg(String project, Pageable paginate, String query);

	Long getPromptsCountByOrg(String project, String query);

	ICIPPrompts findByNameAndOrganization(String name, String org);
	
	ICIPPrompts findByAliasAndOrganization(String alias, String org);

	List<ICIPPrompts> findAllByOrganization(String project); 

	
}
