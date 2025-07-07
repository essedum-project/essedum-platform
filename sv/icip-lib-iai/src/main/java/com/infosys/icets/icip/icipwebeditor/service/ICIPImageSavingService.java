package com.infosys.icets.icip.icipwebeditor.service;

import com.infosys.icets.icip.icipwebeditor.model.ICIPImageSaving;

public interface ICIPImageSavingService  {

	ICIPImageSaving saveImage(ICIPImageSaving iCIPImageSaving);

	ICIPImageSaving getByNameAndOrg(String name, String org);

	ICIPImageSaving updateImage(ICIPImageSaving iCIPImageSaving);
	
	

}
