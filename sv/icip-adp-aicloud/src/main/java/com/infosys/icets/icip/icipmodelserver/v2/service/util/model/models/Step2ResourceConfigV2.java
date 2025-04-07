package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import java.util.ArrayList;

import org.json.JSONArray;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
public class Step2ResourceConfigV2 {
	JSONArray computes;
	Integer volumeSizeinGB;
}
