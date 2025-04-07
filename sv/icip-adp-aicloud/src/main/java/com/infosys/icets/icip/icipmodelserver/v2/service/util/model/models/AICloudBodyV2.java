package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import com.google.gson.JsonObject;
import lombok.Getter;
import lombok.Setter;

   

@Getter
@Setter
public class AICloudBodyV2 {
	    private String projectId;
	    private String description;
	    private JsonObject pipeline;
	   

}