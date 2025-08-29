package com.lfn.icip.dataset.service.aspect;

import java.io.IOException;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import com.lfn.ai.comm.lib.util.ICIPUtils;
import com.lfn.ai.comm.lib.util.annotation.service.ConstantsService;
import com.lfn.icip.dataset.model.ICIPDataset;
import com.lfn.icip.dataset.model.ICIPDatasource;

/**
 * class resolver aspect
 * setting dataset url 
 * setting datasource url.
 */
@Aspect
@Component
public class ResolverAspect {

//	/** The dash constant service. */
//	private DashConstantService dashConstantService;
	
	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ResolverAspect.class);

	/** The environment. */
	private Environment environment;
	
	/** The claim. */
	@Value("${security.claim:#{null}}")
	private String claim;

	@Autowired
	private ConstantsService dashConstantService;

	/**
	 * Instantiates a new resolver aspect.
	 *
	 * @param dashConstantService the dash constant service
	 * @param environment the environment
	 */
	public ResolverAspect(Environment environment) {
		this.environment = environment;
	}
	
	/**
	 * Gets the dataset data.
	 *
	 * @param joinPoint the join point
	 * @param dataset the dataset
	 * @return the dataset data
	 */
	@Before(value = "execution(* com.lfn.icip.dataset.service.util.IICIPDataSetServiceUtil.getDatasetData(..)) and args(dataset,..) ", argNames = "dataset")
	public void getDatasetData(JoinPoint joinPoint, ICIPDataset dataset) {
		resolve(dataset);
	}
	
	/**
	 * Resolve ICIP dataset plugins service.
	 *
	 * @param joinPoint the join point
	 * @param dataset the dataset
	 */
	@Before(value = "execution(* com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService.*(..)) and !execution(* com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService.getDataSetService(..)) and !execution(* com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService.getDataSetServiceSql(..)) and args(dataset,..) ", argNames = "dataset")
	public void resolveICIPDatasetPluginsService(JoinPoint joinPoint, ICIPDataset dataset) {
		resolve(dataset);
	}

	/**
	 * Resolve ICIP dataset service name.
	 *
	 * @param dataset the dataset
	 */
	@AfterReturning(pointcut = "execution(* com.lfn.icip.dataset.service.impl.ICIPDatasetService.*(..))", returning = "dataset")
	public void resolveICIPDatasetServiceName(ICIPDataset dataset) {
		resolve(dataset);
	}

	/**
	 * Resolve ICIP dataset plugins service name.
	 *
	 * @param dataset the dataset
	 */
	@AfterReturning(pointcut = "execution(* com.lfn.icip.dataset.service.impl.ICIPDatasetPluginsService.*(..))", returning = "dataset")
	public void resolveICIPDatasetPluginsServiceName(ICIPDataset dataset) {
		resolve(dataset);
	}

	/**
	 * Resolve ICIP dataset service name.
	 *
	 * @param datasource the datasource
	 */
	@AfterReturning(pointcut = "execution(* com.lfn.icip.dataset.service.impl.ICIPDatasourceService.*(..))", returning = "datasource")
	public void resolveICIPDatasetServiceName(ICIPDatasource datasource) {
		resolve(datasource);
	}

	/**
	 * Resolve ICIP dataset plugins service.
	 *
	 * @param joinPoint the join point
	 * @param datasource the datasource
	 */
	@Before(value = "execution(* com.lfn.icip.dataset.service.impl.ICIPDatasourcePluginsService.*(..)) and args(datasource,..)", argNames = "datasource")
	public void resolveICIPDatasetPluginsService(JoinPoint joinPoint, ICIPDatasource datasource) {
		resolve(datasource);
	}

	/**
	 * Resolve.
	 *
	 * @param dataset the dataset
	 */
	public void resolve(ICIPDataset dataset) {
		String keyword = "@projectname";
		dataset.setAttributes(dataset.getAttributes().replace(keyword, dataset.getOrganization()));
		String userKeyword = "@username";
		dataset.setAttributes(dataset.getAttributes().replace(userKeyword, "'" + ICIPUtils.getUser(claim) + "'"));
	}

	/**
	 * Resolve.
	 *
	 * @param datasource the datasource
	 */
	public void resolve(ICIPDatasource datasource) {
		String keyword1 = "@datasourceurl";
		String key1 = "icip.dsurl";
		String keyword2 = "@datasourceuser";
		String key2 = "icip.dsuser";
		String keyword3 = "@datasourcepass";
		String key3 = "icip.dspass";
		resolve(datasource, keyword1, key1);
		resolve(datasource, keyword2, key2);
		resolve(datasource, keyword3, key3);
	}

	/**
	 * Resolve.
	 *
	 * @param datasource the datasource
	 * @param keyword the keyword
	 * @param key the key
	 * @throws IOException 
	 */
	private void resolve(ICIPDatasource datasource, String keyword, String key)  {
		String variable;
		if(datasource != null) {
			String value = dashConstantService.findByKeys(key, datasource.getOrganization());
			if (value.trim().isEmpty()) {
				variable = environment.getProperty(key);
			} else {
				variable = value;
			}
			if (variable == null) {
				variable = "NOT_FOUND";
			}
			datasource.setConnectionDetails(datasource.getConnectionDetails().replace(keyword, variable));
		}
	}

}
