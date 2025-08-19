package com.lfn.icip.icipwebeditor.service.aspect;

import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.icip.icipwebeditor.model.ICIPStreamingServices;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class IAIResolverAspect.
 */
@Aspect
@Component
/** The Constant log. */
@Log4j2
public class IAIResolverAspect {

	/** The dash constant service. */
//	@Autowired
//	private DashConstantService dashConstantService;

	/** The environment. */
	@Autowired
	private Environment environment;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;
	
	@Autowired
	private ConstantsService constantService;

	

	/**
	 * Resolve get streaming services name.
	 *
	 * @param pipeline the pipeline
	 */
	/*
	 * return pipeline after "execution" */
	@AfterReturning(pointcut = "execution(* com.lfn.icip.icipwebeditor.service.impl.ICIPStreamingServiceService.getStreamingServices(..))", returning = "pipeline")
	public void resolveGetStreamingServicesName(ICIPStreamingServices pipeline) {
		resolve(pipeline);
	}

	/**
	 * Resolve get ICIP streaming services refactored name.
	 *
	 * @param pipeline the pipeline
	 */
	/*return pipeline after "execution"*/
	@AfterReturning(pointcut = "execution(* com.lfn.icip.icipwebeditor.service.impl.ICIPStreamingServiceService.getICIPStreamingServicesRefactored(..))", returning = "pipeline")
	public void resolveGetICIPStreamingServicesRefactoredName(ICIPStreamingServices pipeline) {
		resolve(pipeline);
	}

	/**
	 * Resolve.
	 *
	 * @param pipeline the pipeline
	 */
	/*
	 * @param pipeline
	 * resolve data of dataset*/
	private void resolve(ICIPStreamingServices pipeline) {
		pipeline.setJsonContent(resolveDatasetData(pipeline.getJsonContent(), pipeline.getOrganization()));
	}

	/**
	 * Resolve dataset data.
	 *
	 * @param data the data
	 * @param org the org
	 * @return the string
	 */
	/*
	 * @param data
	 * @param org
	 * @param keyword
	 * replace data with userKeyword,"'" ,ICIPUtils' user of claims
	 * @return resolveDatasourceData
	 */
	public String resolveDatasetData(String data, String org) {
		org = org.toLowerCase();
		String keyword = "@projectname";
		data = data.replace(keyword, org);
		String userKeyword = "@username";
		data = data.replace(userKeyword, "'" + ICIPUtils.getUser(claim) + "'");
		return resolveDatasourceData(data, org);
	}

	/**
	 * Resolve datasource data.
	 *
	 * @param data the data
	 * @param org the org
	 * @return the string
	 */
	/*
	 * @param data of data
	 * @param org of org
	 * set strings for urls 
	 * @return resolve*/
	public String resolveDatasourceData(String data, String org) {
		org = org.toLowerCase();
		String keyword1 = "@datasourceurl";
		String key1 = "icip.dsurl";
		String keyword2 = "@datasourceuser";
		String key2 = "icip.dsuser";
		String keyword3 = "@datasourcepass";
		String key3 = "icip.dspass";
		data = resolve(data, org, keyword1, key1);
		data = resolve(data, org, keyword2, key2);
		return resolve(data, org, keyword3, key3);
	}

	/**
	 * Resolve.
	 *
	 * @param data the data
	 * @param org the org
	 * @param keyword the keyword
	 * @param key the key
	 * @return the string
	 */
	private String resolve(String data, String org, String keyword, String key) {
		String variable;
		String dashConstant = constantService.findByKeys(key, org);
		if (dashConstant.trim().isEmpty()) {
			variable = environment.getProperty(key);
		} else {
			variable = dashConstant;
		}
		if (variable == null) {
			variable = "NOT_FOUND";
		}
		return data.replace(keyword, variable);
	}

}