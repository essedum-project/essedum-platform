package com.lfn.icip.dataset.service.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.dataset.model.ICIPRating;
import com.lfn.icip.dataset.model.dto.ICIPRatingDetails;
import com.lfn.icip.dataset.repository.ICIPRatingRepository;
import com.lfn.icip.dataset.service.IICIPRatingService;

@Service
@Transactional
public class ICIPRatingService implements IICIPRatingService{
	
	@Autowired
	private ICIPRatingRepository ratingRepo;
	
	/** The Constant logger. */
	private static final Logger logger = LoggerFactory.getLogger(ICIPRatingService.class);

	@Override
	public List<ICIPRatingDetails> getAllByUserAndOrg(Integer user, String module, String org, Integer page, Integer size) {
		List<ICIPRatingDetails> result = ratingRepo.getAllByUserAndOrganization(user, module, org, PageRequest.of(page-1,size));
		return result;
	}
	
	@Override
	public Long getAllCountByUserAndOrg(Integer user, String module, String org) {
		Long result = ratingRepo.getAllCountByUserAndOrganization(user, module, org);
		return result;
	}
	
	@Override
	public List<String> getAllModuleByUserOrganization(Integer user, String org) {
		List<String> modules = ratingRepo.getAllModuleByUserOrganization(user, org);
		return modules;
	}
	
	@Override
	public List<ICIPRating> getRatingByUserAndModuleAndOrganization(Integer user, String module, String org) {
		return ratingRepo.getRatingByUserAndModuleAndOrganization(user, module, org);
	}
	
	@Override
	public ICIPRating save(ICIPRating rating) {
		ICIPRating ratingPresent = ratingRepo.getRatingByUserAndModuleAndOrganizationAndElement(rating.getUser(),rating.getModule()
				,rating.getOrganization(),rating.getElement());
		if(ratingPresent != null) {
			ratingRepo.deleteRating(ratingPresent.getId());
		}
		return ratingRepo.save(rating);
	}
	
	@Override
	public void deleteRatingByElementAndModuleAndOrg(String element, String module, String org) {
		List<String> moduleList = getModuleList(module);
		try {
			logger.info("deleting datasoure");
			ratingRepo.deleteRatingByElementAndModuleAndOrg(element, moduleList, org);
		}
		catch(Exception e) {
			logger.error("Error in deleting rating", e);
		}
	}
	
	@Override
	public ICIPRating getRatingByUserAndModuleAndOrganizationAndElement(Integer user, String module, String org, String ele) {
		return ratingRepo.getRatingByUserAndModuleAndOrganizationAndElement(user, module, org, ele);
	}
	
	
	private ArrayList<String> getModuleList(String module){
		
		ArrayList<String> arr1 = new ArrayList<String>(
				Arrays.asList("Dataset", "Knowledge", "Comprehend"));
		ArrayList<String> arr2 = new ArrayList<String>(
				Arrays.asList("Pipeline", "Chains", "App"));
		
		ArrayList<ArrayList<String>> moduleList = new ArrayList<ArrayList<String>>();
		moduleList.add(arr1);
		moduleList.add(arr2);
		
		ArrayList<String> result = new ArrayList<String>();
		moduleList.forEach(e ->{
			if(e.contains(module)) {
				result.addAll(e);
			}	
		});
		return result;
	}

}
