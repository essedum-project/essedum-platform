package com.lfn.icip.icipwebeditor.service.aspect;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.quartz.JobPersistenceException;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.lfn.ai.comm.lib.util.annotation.EssedumProperty;
import com.lfn.icip.icipwebeditor.job.quartz.model.QrtzTriggers;
import com.lfn.icip.icipwebeditor.job.quartz.repository.QrtzTriggersRepository;

import lombok.extern.log4j.Log4j2;

// TODO: Auto-generated Javadoc
/**
 * The Class JobTriggerAspect.
 */
@Aspect
@Component

/** The Constant log. */
@Log4j2
@RefreshScope
public class JobTriggerAspect {
	

	/** The qrtz retry limit str. */
	@EssedumProperty("icip.quartz.retrylimit")
	private String qrtzRetryLimitStr;

	/** The mailserver url. */
	@EssedumProperty("icip.mailserver.url")
	private String mailserverUrl;

	/** The access token. */
	@Value("${mailserver.accesstoken}")
	private String accessToken;

	/** The receiver. */
	@EssedumProperty("icip.mailserver.receiver")
	private String receiver;

	/** The mail to receiver str. */
	@EssedumProperty("icip.mailserver.mailtoreceiver")
	private String mailToReceiverStr;

	/** The scheduler. */
	private Scheduler scheduler;
	
	/** The repository. */
	private QrtzTriggersRepository repository;
	
	/** The rest template. */
	private RestTemplate restTemplate;

	/**
	 * Instantiates a new job trigger aspect.
	 *
	 * @param schedulerFactoryBean the scheduler factory bean
	 * @param repository the repository
	 * @param restTemplate the rest template
	 */
	public JobTriggerAspect(SchedulerFactoryBean schedulerFactoryBean, QrtzTriggersRepository repository,
			RestTemplate restTemplate) {
		this.scheduler = schedulerFactoryBean.getScheduler();
		this.repository = repository;
		this.restTemplate = restTemplate;
	}

	/**
	 * Check error.
	 *
	 * @param ex the ex
	 */
	@AfterThrowing(pointcut = "execution(* org.quartz.impl.jdbcjobstore.JobStoreSupport.*(..))", throwing = "ex")
	public void checkError(JobPersistenceException ex) {
		String message = "Couldn't retrieve job: Deadlock found";
		if (ex.getMessage().trim().toLowerCase().contains(message.toLowerCase())) {
			ExecutorService executorService = Executors.newFixedThreadPool(1);
			executorService.execute(() -> {
				List<QrtzTriggers> triggers = new ArrayList<>();
				for (int index = 0, limit = Integer.parseInt(qrtzRetryLimitStr); index < limit; index++) {
					try {
						triggers = resetTrigger();
					} catch (Exception e) {
						log.error("Error in resetting trigger : {}", e.getMessage(), e);
					}
				}
				if (Boolean.parseBoolean(mailToReceiverStr)) {
					List<QrtzTriggers> newtriggerlist = repository
							.findByTriggerState(Trigger.TriggerState.ERROR.toString());
					for (QrtzTriggers trigger : newtriggerlist) {
						if (triggers.contains(trigger)) {
							try {
								sendMail(receiver, "Trigger went into ERROR state", trigger.getDescription(),null);
							} catch (Exception e) {
								log.error("Error in sending mail : {}", e.getMessage(), e);
							}
						}
					}
				}
			});
			executorService.shutdown();
		}
	}

	/**
	 * Reset trigger.
	 *
	 * @return the list
	 * @throws SchedulerException the scheduler exception
	 * @throws InterruptedException the interrupted exception
	 */
	private List<QrtzTriggers> resetTrigger() throws SchedulerException, InterruptedException {
		Thread.sleep(60000);
		List<QrtzTriggers> triggers = repository.findByTriggerState(Trigger.TriggerState.ERROR.toString());
		for (QrtzTriggers trigger : triggers) {
			scheduler.resetTriggerFromErrorState(
					TriggerKey.triggerKey(trigger.getTriggerName(), trigger.getTriggerGroup()));
		}
		return triggers;
	}

	/**
	 * Send mail.
	 *
	 * @param to the to
	 * @param subject the subject
	 * @param message the message
	 */
	private void sendMail(String to, String subject, String message, MultipartFile attachments) {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.MULTIPART_FORM_DATA);
		headers.set("access-token", accessToken);
		MultiValueMap<String, Object> map = new LinkedMultiValueMap<>();
		map.add("to", to);
		map.add("subject", subject);
		map.add("message", message);
		if(attachments!=null)map.add("attachments", attachments.getResource());
		HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(map, headers);
		String url = String.format("%s%s", mailserverUrl, "/api/email/message");
		restTemplate.postForEntity(url, request, null);
	}

}