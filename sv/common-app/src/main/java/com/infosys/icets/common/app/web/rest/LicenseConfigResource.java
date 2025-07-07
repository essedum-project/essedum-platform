package com.infosys.icets.common.app.web.rest;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infosys.icets.common.app.web.license.LicenseValidate;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Setter;

@RestController
@RequestMapping("/api")
@Setter
@RefreshScope
@Tag(name= "Common APIs")
public class LicenseConfigResource {

	/** The logger. */
	private final Logger logger = LoggerFactory.getLogger(ApplicationConfigResource.class);
	
	@Autowired
	private LicenseValidate licenseValidate;
	
	@Operation(summary = "Get the count of Days for the License expiry")
	@PostMapping("/license") 
	 public ResponseEntity<?> validateLicense() throws UnsupportedEncodingException, InvalidAlgorithmParameterException{
		logger.info("Getting the Conut of Licence for Remaining Days");
		return new ResponseEntity<>(this.licenseValidate.getValidDays(),HttpStatus.OK);
		
	}
}
