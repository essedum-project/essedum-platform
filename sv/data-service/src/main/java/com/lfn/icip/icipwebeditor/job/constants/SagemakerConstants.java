package com.lfn.icip.icipwebeditor.job.constants;



import org.springframework.stereotype.Component;

import lombok.Getter;

// TODO: Auto-generated Javadoc
/**
 * The Class FileServerConstants.
 */
@Component

/**
 * Gets the metadata.
 *
 * @return the metadata
 */

/**
 * Gets the metadata.
 *
 * @return the metadata
 */
@Getter
public class SagemakerConstants {

	/** The timestamp file. */
	private String credential_profile = "default";

	/** The count file. */
	private String stepconfig_name = "Enable debugging";

	/** The checksum. */
	private String imageURI = "451256804668.dkr.ecr.us-east-1.amazonaws.com/aiplat:latest";
	private String roleArn = "arn:aws:iam::451256804668:role/aiplat";
	private String environment = "PYTHONUNBUFFERED";
	private String map= "TRUE";
	private String s3DataType = "S3Prefix";
	private String s3InputMode = "File";
	

}