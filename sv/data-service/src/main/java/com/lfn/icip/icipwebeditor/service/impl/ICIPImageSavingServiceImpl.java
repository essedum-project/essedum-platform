package com.lfn.icip.icipwebeditor.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.lfn.ai.comm.lib.util.logger.JobLogger;
import com.lfn.icip.icipwebeditor.model.ICIPImageSaving;
import com.lfn.icip.icipwebeditor.repository.ICIPImageSavingRepository;
import com.lfn.icip.icipwebeditor.service.ICIPImageSavingService;
@Service
public class ICIPImageSavingServiceImpl implements ICIPImageSavingService {
	/** The log. */
	private final Logger log = LoggerFactory.getLogger(JobLogger.class);
	@Autowired
	ICIPImageSavingRepository ICIPImageSavingRepository;
	
	@Override
	public ICIPImageSaving saveImage(ICIPImageSaving iCIPImageSaving) {
		
//		ICIPImageSaving iCIPImageSaving = new ICIPImageSaving();
//		iCIPImageSaving.setFileName(fileName);
//		iCIPImageSaving.setMimeType(mimeType);
//		iCIPImageSaving.setUrl(url);
//		iCIPImageSaving.setOrganization(organization);
		return ICIPImageSavingRepository.save(iCIPImageSaving);
		 
	}

	@Override
	public ICIPImageSaving getByNameAndOrg(String name, String org) {
		return ICIPImageSavingRepository.getByNameAndOrg(name, org);
	}

	@Override
	public ICIPImageSaving updateImage(ICIPImageSaving iCIPImageSaving) {
		return ICIPImageSavingRepository.save(iCIPImageSaving);
	}

	public boolean copy(String fromProjectName, String toProjectId) {
		List<ICIPImageSaving> imageList = ICIPImageSavingRepository.getByOrg(fromProjectName);
		imageList.stream().forEach(image -> {
			ICIPImageSaving img = ICIPImageSavingRepository.getByNameAndOrg(image.getName(),fromProjectName);
			try {
			img.setId(null);
			img.setOrganization(toProjectId);
			ICIPImageSavingRepository.save(img);
			}
			catch (Exception e) {
				log.error("Error in ICIPImageSaving Copy Blueprint {}", e.getMessage());
			}
		});
		return true;
	}
	
	
	

}
