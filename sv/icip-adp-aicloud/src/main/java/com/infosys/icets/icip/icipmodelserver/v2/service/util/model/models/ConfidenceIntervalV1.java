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
public class ConfidenceIntervalV1 {
	private String upperBound;
	private String lowerBound;
}
