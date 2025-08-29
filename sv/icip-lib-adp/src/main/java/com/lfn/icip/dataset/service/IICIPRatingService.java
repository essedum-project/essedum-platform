package com.lfn.icip.dataset.service;

import java.util.List;

import com.lfn.icip.dataset.model.ICIPRating;
import com.lfn.icip.dataset.model.dto.ICIPRatingDetails;

public interface IICIPRatingService {
	
	public List<ICIPRatingDetails> getAllByUserAndOrg(Integer user, String module, String org, Integer page, Integer size);
	
	public Long getAllCountByUserAndOrg(Integer user, String module, String org);

	public List<String> getAllModuleByUserOrganization(Integer user, String org);

	public List<ICIPRating> getRatingByUserAndModuleAndOrganization(Integer user, String module, String org);

	public ICIPRating save(ICIPRating rating);

	public void deleteRatingByElementAndModuleAndOrg(String element, String module, String org);
	
	public ICIPRating getRatingByUserAndModuleAndOrganizationAndElement(Integer user, String module, String org, String ele);

}
