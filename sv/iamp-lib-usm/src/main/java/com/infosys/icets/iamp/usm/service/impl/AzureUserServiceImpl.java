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

import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.infosys.icets.ai.comm.lib.util.annotation.LeapProperty;
import com.infosys.icets.iamp.usm.domain.Users;
import com.microsoft.graph.authentication.TokenCredentialAuthProvider;
import com.microsoft.graph.core.ClientException;
import com.microsoft.graph.models.Invitation;
import com.microsoft.graph.requests.GraphServiceClient;

@Service
@Transactional
public class AzureUserServiceImpl {

	private final Logger log = LoggerFactory.getLogger(AzureUserServiceImpl.class);

	@LeapProperty("application.azure.clientId")
	private String clientId;

	@LeapProperty("application.azure.clientSecret")
	private String clientSecret;

	@LeapProperty("application.azure.tenantId")
	private String tenantId;

	@LeapProperty("application.azure.scope")
	private String scope;
	
	@LeapProperty("application.azure.inviteRedirectUrl")
	private String inviteRedirectUrl;

	public boolean inviteAzureUser(Users user) {
		log.info("initializing user invitation");
		List<String> scopes = Arrays.asList(scope);
		final ClientSecretCredential clientSecretCredential = new ClientSecretCredentialBuilder().clientId(clientId)
				.clientSecret(clientSecret).tenantId(tenantId).build();

		final TokenCredentialAuthProvider tokenCredentialAuthProvider = new TokenCredentialAuthProvider(scopes,
				clientSecretCredential);
		GraphServiceClient graphClient = GraphServiceClient.builder()
				.authenticationProvider(tokenCredentialAuthProvider).buildClient();

		try {
			Invitation invitation = new Invitation();
			invitation.invitedUserEmailAddress = user.getUser_email();
			invitation.inviteRedirectUrl = inviteRedirectUrl;
			invitation.sendInvitationMessage = true;

			graphClient.invitations().buildRequest().post(invitation);
			log.info("invitation sent successfully");
			return true;
			// create user in usm-user table and assign default roles on success

		} catch (ClientException e) {
			// TODO Auto-generated catch block
			log.error("unable to send invitation", e.getMessage());
			return false;
		}
	}

}
