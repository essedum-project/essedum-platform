package com.lfn.icip.dataset.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import com.lfn.icip.dataset.model.ICIPRating;
import com.lfn.icip.dataset.model.dto.ICIPRatingDetails;

@NoRepositoryBean
public interface ICIPRatingRepository extends JpaRepository<ICIPRating, Integer>{
		
	List<ICIPRatingDetails> getAllByUserAndOrganization(Integer user, String module, String org, Pageable pageable);
	
	Long getAllCountByUserAndOrganization(Integer user, String module, String org);

	List<String> getAllModuleByUserOrganization(Integer user, String org);

	List<ICIPRating> getRatingByUserAndModuleAndOrganization(Integer user, String module, String org);

	void deleteRatingByElementAndModuleAndOrg(String element, List<String> moduleList, String org);
	
	ICIPRating save(ICIPRating rating);
	
	ICIPRating getRatingByUserAndModuleAndOrganizationAndElement(Integer user, String module, String org, String ele);

	void deleteRating(Integer id);
}
