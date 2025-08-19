package com.lfn.icip.dataset.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lfn.icip.dataset.model.ICIPTags;
import com.lfn.icip.dataset.repository.ICIPTagsRepository;
import com.lfn.icip.dataset.service.IICIPTagsService;

@Service
@Transactional
	public  class IICIPTagsServiceImpl implements IICIPTagsService {
		
	
	private final Logger log = LoggerFactory.getLogger(IICIPTagsServiceImpl.class);
		@Autowired
	    private  ICIPTagsRepository tagsRepo;
	    
		
		
		

		@Override
		public List<ICIPTags> getTags() {
			// TODO Auto-generated method stub
		    return tagsRepo.findAll();
		}
		
		@SuppressWarnings("deprecation")
		@Override
		public ICIPTags getById(Integer Id) { 
			  
		
			// TODO Auto-generated method stub
			return tagsRepo.findById(Id).get();
			
		}

		
		@Override
		public ICIPTags addTags(ICIPTags tags) {
			// TODO Auto-generated method stub
			
			return tagsRepo.save(tags);
		}
			
		@Override
		public ICIPTags updateTags(Integer id,ICIPTags tags) {
			// TODO Auto-generated method stub
			ICIPTags alltags= tagsRepo.getById(id);
			alltags.setCategory(tags.getCategory());
			alltags.setLabel(tags.getLabel());
			return tagsRepo.save(alltags);
			
		}
	
		
		@Override
		public void deleteTags(Integer id) {
			
		 	tagsRepo.deleteById(id);
			 
		}

		@Override
		public List<ICIPTags> getAllTagsByProjectAndService(String project, String service) {
			List<ICIPTags> tagList=tagsRepo.findAllTagsByEntityTypeAndOrganization(service,project);

			return tagList;
		}






		
		
		
		

}

