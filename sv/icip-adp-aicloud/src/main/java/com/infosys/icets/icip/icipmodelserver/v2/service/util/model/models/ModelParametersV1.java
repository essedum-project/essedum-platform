package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ModelParametersV1 {
	private String modelArchitecture;
	private String outputFormat;
	private JSONArray outputFormatMap;
	private String inputFormat;
	private JSONArray inputFormatMap;
	private JSONArray data;
}
