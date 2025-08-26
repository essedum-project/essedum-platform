package com.lfn.icip.icipwebeditor.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.lfn.icip.icipwebeditor.fileserver.dto.ICIPChunkMetaData;
import com.lfn.icip.icipwebeditor.model.ICIPApps;
import com.lfn.icip.icipwebeditor.v1.dto.BaseEntity;

import reactor.core.publisher.Flux;


public interface IICIPAppService {

	ICIPApps save(ICIPApps app);
	
	void delete(Integer id);
	
	ICIPApps getAppByName(String name,String orgid);
	
	List<ICIPApps> getByOrganization(String organization);
	
	public void uploadFile(MultipartFile multipartfile, String fileid, ICIPChunkMetaData chunkMetaData, String org) throws Exception;
	
	List<Map<String,Object>> getAllApps();
	
	public String uploadToActiveServer(String object, String uploadFile, String org);

	public String getPresignedUrl(String fileName, String org);
	
	Optional<ICIPApps> findByID(Integer id);

	List<String> getAppsType();

	Flux<BaseEntity> getAllObjectsByOrganization(String organization, String search, Pageable page);
	

	Flux<BaseEntity> getObjectByIDTypeAndOrganization(String type, Integer id, String organization);

}
