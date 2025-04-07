/**
 * @ 2023 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.ai.comm.lib.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;

// 
/**
 * Utility class for HTTP headers creation.
 */
/**
* @author icets
*/
public final class HeaderUtil {

    /** The Constant log. */
    private static final Logger log = LoggerFactory.getLogger(HeaderUtil.class);

    /** The Constant APPLICATION_NAME. */
    private static final String APPLICATION_NAME = "leap";

    /**
     * Instantiates a new header util.
     */
    private HeaderUtil() {
    }

    /**
     * Creates the alert.
     *
     * @param message the message
     * @param param the param
     * @return the http headers
     */
    public static HttpHeaders createAlert(String message, String param) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-" + APPLICATION_NAME + "-alert", message);
        headers.add("X-" + APPLICATION_NAME + "-params", param);
        return headers;
    }

    /**
     * Creates the entity creation alert.
     *
     * @param entityName the entity name
     * @param param the param
     * @return the http headers
     */
    public static HttpHeaders createEntityCreationAlert(String entityName, String param) {
        return createAlert("A new " + entityName + " is created with identifier " + param, param);
    }

    /**
     * Creates the entity update alert.
     *
     * @param entityName the entity name
     * @param param the param
     * @return the http headers
     */
    public static HttpHeaders createEntityUpdateAlert(String entityName, String param) {
        return createAlert("A " + entityName + " is updated with identifier " + param, param);
    }

    /**
     * Creates the entity deletion alert.
     *
     * @param entityName the entity name
     * @param param the param
     * @return the http headers
     */
    public static HttpHeaders createEntityDeletionAlert(String entityName, String param) {
        return createAlert("A " + entityName + " is deleted with identifier " + param, param);
    }

    /**
     * Creates the failure alert.
     *
     * @param entityName the entity name
     * @param errorKey the error key
     * @param defaultMessage the default message
     * @return the http headers
     */
    public static HttpHeaders createFailureAlert(String entityName, String errorKey, String defaultMessage) {
        log.error("Entity processing failed, {}", defaultMessage);
        log.error("Error key, {}",errorKey);
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-" + APPLICATION_NAME + "-error", defaultMessage);
        headers.add("X-" + APPLICATION_NAME + "-params", entityName);
        return headers;
    }
    
    /**
     * Custom query alert.
     *
     * @param entityName the entity name
     * @param string the string
     * @return the http headers
     */
    public static HttpHeaders customQueryAlert(String entityName, String string) {
		log.error("Entity processing failed, {}", string);
		HttpHeaders headers = new HttpHeaders();
		headers.add("X-pamApp-error", "error." + string);
		headers.add("X-pamApp-params", entityName);
		return headers;
	}

}
