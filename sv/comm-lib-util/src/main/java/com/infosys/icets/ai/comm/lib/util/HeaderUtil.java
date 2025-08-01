/**
 * The MIT License (MIT)
 * Copyright © 2025 Infosys Limited
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
