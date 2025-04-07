package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ModelParametersV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.QuantitativeAnalysis;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ConsiderationsV1;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ModelDetailsV1;
@Getter
@Setter
@NoArgsConstructor
public class ModelMetadataV1 {
	private ModelDetailsV1 modelDetails;
	private ModelParametersV1 modelParameters;
	private QuantitativeAnalysis quantitativeAnalysis;
	private ConsiderationsV1 considerations;
}
