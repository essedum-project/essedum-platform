package com.lfn.icip.icipwebeditor.service;

import java.io.IOException;
import java.net.URISyntaxException;
import java.security.InvalidKeyException;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;

import org.json.JSONObject;

public interface ICIPPromptChatModel {

	public String postPromptToModel(JSONObject body) throws URISyntaxException, IOException, NoSuchAlgorithmException, InvalidKeyException, KeyManagementException, KeyStoreException;

	public String postPromptFromEndpoint(JSONObject jsonObject, String restprovider, String org) throws IOException, NoSuchAlgorithmException, InvalidKeyException, KeyManagementException, KeyStoreException, URISyntaxException;

}
