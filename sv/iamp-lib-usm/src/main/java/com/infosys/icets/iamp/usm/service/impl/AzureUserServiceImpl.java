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
