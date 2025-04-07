package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;
import java.sql.Date;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class VersionHistoryV1 {
	private String name;
	private String diff;
	private Date date;
}
