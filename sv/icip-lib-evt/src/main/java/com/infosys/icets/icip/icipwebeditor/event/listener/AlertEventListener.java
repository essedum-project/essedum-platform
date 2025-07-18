/**
 * @ 2021 - 2022 Infosys Limited, Bangalore, India. All Rights Reserved.
 * Version: 1.0
 * Except for any free or open source software components embedded in this Infosys proprietary software program (Program),
 * this Program is protected by copyright laws,international treaties and  other pending or existing intellectual property
 * rights in India,the United States, and other countries.Except as expressly permitted, any unauthorized reproduction,storage,
 * transmission in any form or by any means(including without limitation electronic,mechanical, printing,photocopying,
 * recording, or otherwise), or any distribution of this program, or any portion of it,may result in severe civil and
 * criminal penalties, and will be prosecuted to the maximum extent possible under the law.
 */
package com.infosys.icets.icip.icipwebeditor.event.listener;

import java.security.cert.X509Certificate;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.apache.hc.core5.ssl.TrustStrategy;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
//import com.infosys.icets.iamp.usm.dto.UsmNotificationsDTO;
//import com.infosys.icets.iamp.usm.service.UsmNotificationsService;
import com.infosys.icets.icip.icipwebeditor.event.model.AlertEvent;


import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
//
/**
 * The Class AlertEventListener.
 *
 * @author icets
 */

/** The Constant log. */

/** The Constant log. */

/** The Constant log. */
@Log4j2
@Component
//@RefreshScope
public class AlertEventListener {

	/** The mailserver url. */
	@LeapProperty("icip.mailserver.url")
	private String mailserverUrl;

	/** The access token. */
	@Value("${mailserver.accesstoken}")
	private String accessToken;

	/** The mailserver enabled. */
	@LeapProperty("icip.mailserver.enabled")
	private String mailserverEnabled;

	/** The mailserver receiver. */
	@LeapProperty("icip.mailserver.receiver")
	private String mailserverReceiver;

	/** The mail to receiver. */
	@LeapProperty("icip.mailserver.mailtoreceiver")
	private String mailToReceiver;

	/** The usm notifications service. */
//	@Autowired
//	private UsmNotificationsService usmNotificationsService;

	/**
	 * Send mail.
	 *
	 * @param restTemplate the rest template
	 * @param to           the to
	 * @param subject      the subject
	 * @param message      the message
	 */
	private void sendMail(RestTemplate restTemplate, String to, String subject, String message, MultipartFile attachments) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.MULTIPART_FORM_DATA);
		headers.set("access-token", accessToken);
		MultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
		map.add("to", to);
		map.add("subject", subject);
		map.add("message", message);
		
		if(attachments!=null)map.add("attachments", attachments.getResource());
		if (Boolean.parseBoolean(mailToReceiver)) {
			map.add("cc", mailserverReceiver);
		}
		HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(map, headers);
		String url = String.format("%s%s", mailserverUrl, "/api/email/message");
		restTemplate.postForEntity(url, request, null);
//		restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<MultiValueMap<String, Object>>(map,headers), Map.class);
		
	}

	/**
	 * Creates the notification.
	 *
	 * @param userId   the user id
	 * @param severity the severity
	 * @param source   the source
	 * @param message  the message
	 * @param readFlag the read flag
	 */
	private void createNotification(String userId, String severity, String source, String message, boolean readFlag) {
//		UsmNotificationsDTO notification = new UsmNotificationsDTO();
//		notification.setUserId(userId);
//		notification.setSeverity(severity);
//		notification.setSource(source);
//		notification.setMessage(message);
//		notification.setReadFlag(readFlag);
//		notification.setDateTime(ZonedDateTime.now());
//		usmNotificationsService.save(notification);
	}

	/**
	 * On application event.
	 *
	 * @param event the event
	 */
	@Async
	@EventListener
	public void onApplicationEvent(AlertEvent event) {
		try {
			if (event.isNotificationEnabled()) {
				callNotification(event);
			}
			if (event.isMailServiceEnabled()) {
				TrustStrategy acceptingTrustStrategy = (X509Certificate[] chain, String authType) -> true;
				CloseableHttpClient httpClient = HttpClients.custom().setConnectionManager(PoolingHttpClientConnectionManagerBuilder.create()

		                .setSSLSocketFactory(SSLConnectionSocketFactoryBuilder.create()
		                        .setSslContext(SSLContextBuilder.create()
		                                .loadTrustMaterial(acceptingTrustStrategy)
		                                .build())
		                        .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
		                        .build())
		                .build())
		        .build();

				HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
				requestFactory.setHttpClient(httpClient);
				RestTemplate restTemplate = new RestTemplate(requestFactory);
				callMail(event, restTemplate);
			}
		} catch (Exception ex) {
			log.error(ex.getMessage());
		}
	}

	/**
	 * Call mail.
	 *
	 * @param event        the event
	 * @param restTemplate the rest template
	 */
	private void callMail(AlertEvent event, RestTemplate restTemplate) {
		if (Boolean.parseBoolean(mailserverEnabled)) {
			try {
				sendMail(restTemplate, event.getMailRecipient(), event.getMailSubject(), event.getMailMessage(),event.getMailAttachment());
			} catch (Exception e) {
				log.error(e.getMessage());
			}
		} else {
			log.error("Mail server is down");
		}
	}

	/**
	 * Call notification.
	 *
	 * @param event the event
	 */
	private void callNotification(AlertEvent event) {
		try {
			createNotification(event.getNotificationUserId(), event.getNotificationSeverity(),
					event.getNotificationSource(), event.getNotificationMessage(), event.isNotificationReadFlag());
		} catch (Exception e) {
			log.error(e.getMessage());
		}
	}

}
