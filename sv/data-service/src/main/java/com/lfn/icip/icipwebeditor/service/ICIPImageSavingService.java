package com.lfn.icip.icipwebeditor.service;

import com.lfn.icip.icipwebeditor.model.ICIPImageSaving;

public interface ICIPImageSavingService  {

	ICIPImageSaving saveImage(ICIPImageSaving iCIPImageSaving);

	ICIPImageSaving getByNameAndOrg(String name, String org);

	ICIPImageSaving updateImage(ICIPImageSaving iCIPImageSaving);
	
	

}
