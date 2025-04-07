package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;
import org.json.JSONArray;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models.ConfidenceIntervalV1;

@Getter
@Setter
@NoArgsConstructor
public class PerformanceMetricsV1 {
	private String type;
	private String value;
	private String slice;
	private ConfidenceIntervalV1 confidenceInterval;
	
}
