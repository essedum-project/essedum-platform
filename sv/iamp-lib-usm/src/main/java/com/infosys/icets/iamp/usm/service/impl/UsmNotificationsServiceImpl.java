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
package com.infosys.icets.iamp.usm.service.impl;

import java.sql.SQLException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageRequestByExample;
import com.infosys.icets.ai.comm.lib.util.service.dto.support.PageResponse;
import com.infosys.icets.ai.comm.licenseValidator.LicenseValidator;
import com.infosys.icets.iamp.usm.domain.UsmNotifications;
import com.infosys.icets.iamp.usm.dto.UsmNotificationsDTO;
import com.infosys.icets.iamp.usm.repository.UsmNotificationsRepository;
import com.infosys.icets.iamp.usm.service.UsmNotificationsService;

// TODO: Auto-generated Javadoc
/**
 * Service Implementation for managing UsmNotifications.
 */
/**
 * @author icets
 */
@Service
@Transactional
public class UsmNotificationsServiceImpl implements UsmNotificationsService {

	/** The log. */
	private final Logger log = LoggerFactory.getLogger(UsmNotificationsServiceImpl.class);

	/** The usm notifications repository. */
	private final UsmNotificationsRepository usm_notificationsRepository;
	
	@LeapProperty("license_notification_role") //application.autouser.autoRoles
	private String roleid;

	/**
	 * Instantiates a new usm notifications service impl.
	 *
	 * @param usm_notificationsRepository the usm notifications repository
	 */
	public UsmNotificationsServiceImpl(UsmNotificationsRepository usm_notificationsRepository) {
		this.usm_notificationsRepository = usm_notificationsRepository;
	}

	/**
	 * Save a usm_notifications.
	 *
	 * @param usm_notifications the entity to save
	 * @return the persisted entity
	 */
	@Override
	public UsmNotifications save(UsmNotifications usm_notifications) {
		log.info("Request to save UsmNotifications : {}", usm_notifications);
		return usm_notificationsRepository.save(usm_notifications);
	}

	/**
	 * Get all the widget_configurations.
	 *
	 * @param req the req
	 * @return the list of entities
	 * @throws SQLException the SQL exception
	 */
	@Override
	@Transactional(readOnly = true)
	public PageResponse<UsmNotificationsDTO> getAll(PageRequestByExample<UsmNotifications> req) throws SQLException{
		log.debug("Request to get all UsmNotifications");
		Example<UsmNotifications> example = null;
		UsmNotifications usm_notifications = req.getExample();

		if (usm_notifications != null) {
			ExampleMatcher matcher = ExampleMatcher.matching() // example matcher for userId,severity,source,message
					.withMatcher("userId", match -> match.ignoreCase().startsWith())
					.withMatcher("severity", match -> match.ignoreCase().startsWith())
					.withMatcher("source", match -> match.ignoreCase().startsWith())
					.withMatcher("message", match -> match.ignoreCase().startsWith())
					.withMatcher("roleId", match -> match.ignoreCase().startsWith());

			example = Example.of(usm_notifications, matcher);
		}

		Page<UsmNotifications> page;
		if (example != null) {
			page = usm_notificationsRepository.findAll(example, req.toPageable());
		} else {
			page = usm_notificationsRepository.findAll(req.toPageable());
		}

		return new PageResponse<>(page.getTotalPages(), page.getTotalElements(), page.getContent().stream().map(this::toDTO).collect(Collectors.toList()));
	}

	/**
	 * To DTO.
	 *
	 * @param usm_notifications the usm notifications
	 * @return the usm notifications DTO
	 */
	public UsmNotificationsDTO toDTO(UsmNotifications usm_notifications) {
		return toDTO(usm_notifications, 0);
	}

	/**
	 * Converts the passed usm_notifications to a DTO. The depth is used to control
	 * the amount of association you want. It also prevents potential infinite
	 * serialization cycles.
	 *
	 * @param usm_notifications the usm notifications
	 * @param depth             the depth of the serialization. A depth equals to 0,
	 *                          means no x-to-one association will be serialized. A
	 *                          depth equals to 1 means that xToOne associations
	 *                          will be serialized. 2 means, xToOne associations of
	 *                          xToOne associations will be serialized, etc.
	 * @return the usm notifications DTO
	 */
	public UsmNotificationsDTO toDTO(UsmNotifications usm_notifications, int depth) {
		if (usm_notifications == null) {
			return null;
		}

		UsmNotificationsDTO dto = new UsmNotificationsDTO();

		dto.setId(usm_notifications.getId());

		dto.setSeverity(usm_notifications.getSeverity());

		dto.setSource(usm_notifications.getSource());

		dto.setMessage(usm_notifications.getMessage());

		dto.setDateTime(usm_notifications.getDateTime());

		dto.setReadFlag(usm_notifications.getReadFlag());
		dto.setUserId(usm_notifications.getUserId());
		
		dto.setRoleId(usm_notifications.getRoleId());
		dto.setActionLink(usm_notifications.getActionLink());
		dto.setActionType(usm_notifications.getActionType());	
		dto.setEntityId(usm_notifications.getEntityId());
		dto.setEntityType(usm_notifications.getEntityType());
		
		return dto;
	}

	/**
	 * Save.
	 *
	 * @param usmNotificationsDto the usm notifications dto
	 * @return the usm notifications
	 */
	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * com.infosys.icets.iamp.usm.service.UsmNotificationsService#save(com.infosys.
	 * icets.iamp.usm.dto.UsmNotificationsDTO)
	 */
	@Override
	public UsmNotifications save(UsmNotificationsDTO usmNotificationsDto) {
		UsmNotifications usmNotifications = fromDTO(usmNotificationsDto);
		return usm_notificationsRepository.save(usmNotifications);
	}

	/**
	 * From DTO.
	 *
	 * @param usmNotificationsDto the usm notifications dto
	 * @return the usm notifications
	 */
	private UsmNotifications fromDTO(UsmNotificationsDTO usmNotificationsDto) {
		UsmNotifications usmNotifications = new UsmNotifications();
		
		if (usmNotificationsDto.getId() != null) {
			Optional<UsmNotifications> usmNotification = usm_notificationsRepository
					.findById(usmNotificationsDto.getId());
			usmNotifications = usmNotification.isPresent() ? usmNotification.get() : usmNotifications;
		}
		usmNotifications.setDateTime(usmNotificationsDto.getDateTime());
		usmNotifications.setReadFlag(usmNotificationsDto.getReadFlag());
		usmNotifications.setSeverity(usmNotificationsDto.getSeverity());
		usmNotifications.setSource(usmNotificationsDto.getSource());
		usmNotifications.setUserId(usmNotificationsDto.getUserId());
		usmNotifications.setMessage(usmNotificationsDto.getMessage());
		usmNotifications.setRoleId(usmNotificationsDto.getRoleId());
		usmNotifications.setActionLink(usmNotificationsDto.getActionLink());
		usmNotifications.setActionType(usmNotificationsDto.getActionType());
		usmNotifications.setEntityId(usmNotificationsDto.getEntityId());
		usmNotifications.setEntityType(usmNotificationsDto.getEntityType());

		return usmNotifications;
	}
	
	public void licenseExpiryNotification(String licenseFilePath) throws SQLException{

	    LocalDate serverTodayDate = LocalDate.now();
	    LocalDate licenseStartDate = LocalDate.parse(LicenseValidator.license.getStartDate());
	    int licenseDuration = Integer.valueOf(LicenseValidator.license.getDurationDays());	
	    long daysToExpiry = Duration.between(serverTodayDate.atStartOfDay(),licenseStartDate.atStartOfDay().plusDays(licenseDuration)).toDays();
	    
	    if(daysToExpiry<=30) {
	    List<Integer> roleIdList = new ArrayList<Integer>(); 
		try {
			 if(roleid !=null & roleid!="")
				roleIdList = Arrays.stream(roleid.split(",")).map(Integer::parseInt).collect(Collectors.toList());
			    String daysToExpiry2 = "License will expire in " +Long.toString(daysToExpiry)+ "Days";
			    ZonedDateTime zonedDateTime = ZonedDateTime.now();
				for (Integer integer : roleIdList) {
				UsmNotifications usm = new UsmNotifications();
				usm.setReadFlag(false);
				usm.setSeverity("P1");
				usm.setSource(usm.getSource());
				usm.setDateTime(zonedDateTime);
			    usm.setRoleId(integer);
				usm.setMessage("Remaining days to expire license is " +daysToExpiry+ " days");
				save(usm);
				}
			log.warn(daysToExpiry2);
		
		}
		catch(NumberFormatException e) {
			log.error("leap property license_notification_role is empty or should be comma separated values",e);
		}

	 }
}

}