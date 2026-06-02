package com.lfn.common.app.web.rest;

import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioIdName {

	int portfolioID;
	String portfolioName;
}
