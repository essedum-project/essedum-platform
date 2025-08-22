package com.infosys.icets.icip.icipwebeditor.util;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONObject;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.infosys.icets.ai.comm.lib.util.ICIPUtils;
import com.infosys.icets.icip.icipwebeditor.model.ICIPMLFederatedModel;
import com.infosys.icets.icip.icipwebeditor.model.dto.ICIPMLFederatedModelDTO;

import jakarta.annotation.Nullable;
import jakarta.persistence.Column;

public class ICIPFedModelUtil {
	
public static ICIPMLFederatedModel MapDtoToModel(ICIPMLFederatedModelDTO fedModeldto) {
	ICIPMLFederatedModel fedModel = new ICIPMLFederatedModel();
	fedModel.setId(fedModeldto.getId());
	fedModel.setModelName(fedModeldto.getName());
	fedModel.setVersion(fedModeldto.getVersion());
	fedModel.setModelType(fedModeldto.getType());
	fedModel.setDescription(fedModeldto.getDescription());
	fedModel.setVersion(fedModeldto.getVersion());
	fedModel.setAttributes(fedModeldto.getAttributes());
	fedModel.setDatasource(fedModeldto.getDataSource());
	fedModel.setCreatedBy(fedModeldto.getCreatedBy());
	fedModel.setCreatedOn( Timestamp.from(Instant.now()));
	fedModel.setOrganisation(fedModeldto.getOrganisation());
	return fedModel;
	
}

public static List<ICIPMLFederatedModelDTO> MapModelListToDTOList(List<ICIPMLFederatedModel> modeList) {
	List<ICIPMLFederatedModelDTO> dtoList = new ArrayList<>();
	modeList.forEach(m -> {
		ICIPMLFederatedModelDTO dtoObject = new ICIPMLFederatedModelDTO();
		dtoObject.setId(m.getId());
		dtoObject.setDescription(m.getDescription() != null ? m.getDescription() : "");
		dtoObject.setModifiedBy(m.getModifiedBy() != null ? m.getModifiedBy() : "");
		dtoObject.setModifiedDate(m.getModifiedDate());
		dtoObject.setName(m.getModelName() != null ? m.getModelName() : "");
		dtoObject.setOrganisation(m.getOrganisation());
		dtoObject.setCreatedOn(m.getCreatedOn());
		dtoObject.setVersion(m.getVersion());
		dtoObject.setDataSource(m.getDatasource());
		dtoObject.setAttributes(m.getAttributes());
		dtoObject.setModifiedDate(m.getModifiedDate());
		dtoObject.setCreatedBy(m.getCreatedBy());
		dtoObject.setType(m.getModelType());
		dtoList.add(dtoObject);
	});
	
	return dtoList;
}

public static ICIPMLFederatedModelDTO MapModelToDTO(ICIPMLFederatedModel m) {
	ICIPMLFederatedModelDTO dtoObject = new ICIPMLFederatedModelDTO();
	dtoObject.setId(m.getId());
	dtoObject.setDescription(m.getDescription() != null ? m.getDescription() : "");
	dtoObject.setModifiedBy(m.getModifiedBy() != null ? m.getModifiedBy() : "");
	dtoObject.setModifiedDate(m.getModifiedDate());
	dtoObject.setName(m.getModelName() != null ? m.getModelName() : "");
	dtoObject.setOrganisation(m.getOrganisation());
	dtoObject.setCreatedOn(m.getCreatedOn());
	dtoObject.setVersion(m.getVersion());
	dtoObject.setDataSource(m.getDatasource());
	dtoObject.setCreatedBy(m.getCreatedBy());
	dtoObject.setType(m.getModelType());
	dtoObject.setDataSource(m.getDatasource());
	dtoObject.setVersion(m.getVersion());
	dtoObject.setCreatedOn(m.getCreatedOn());
	dtoObject.setCreatedBy(m.getCreatedBy());
	dtoObject.setType(m.getModelType());
	return dtoObject;
}

}
