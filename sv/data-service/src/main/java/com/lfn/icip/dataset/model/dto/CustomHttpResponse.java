package com.lfn.icip.dataset.model.dto;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Locale;

import org.apache.http.Header;
import org.apache.http.HeaderIterator;
import org.apache.http.HttpEntity;
import org.apache.http.HttpVersion;
import org.apache.http.ProtocolVersion;
import org.apache.http.StatusLine;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.message.BasicStatusLine;
import org.apache.http.params.HttpParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.lfn.icip.dataset.service.util.ICIPDataSetServiceUtilRestAbstract;

import org.apache.http.entity.StringEntity;

public class CustomHttpResponse implements CloseableHttpResponse {

	private StatusLine statusLine;
	private String responseBody;

	/** The logger. */
	private static Logger logger = LoggerFactory.getLogger(ICIPDataSetServiceUtilRestAbstract.class);

	public CustomHttpResponse() {
		this.statusLine = new BasicStatusLine(HttpVersion.HTTP_1_1, 200, "OK");
		this.responseBody = "{ \"Status\": \"Initiated\" }";
	}

	@Override
	public StatusLine getStatusLine() {
		return statusLine;
	}

	@Override
	public HttpEntity getEntity() {
		try {
			return new StringEntity(responseBody, "application/json", "UTF-8");
		} catch (UnsupportedEncodingException e) {
			logger.error("Error in {}", e.getMessage());
		}
		return null;
	}

	@Override
	public void setStatusLine(StatusLine statusline) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setStatusLine(ProtocolVersion ver, int code) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setStatusLine(ProtocolVersion ver, int code, String reason) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setStatusCode(int code) throws IllegalStateException {
		// TODO Auto-generated method stub

	}

	@Override
	public void setReasonPhrase(String reason) throws IllegalStateException {
		// TODO Auto-generated method stub

	}

	@Override
	public void setEntity(HttpEntity entity) {
		// TODO Auto-generated method stub

	}

	@Override
	public Locale getLocale() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setLocale(Locale loc) {
		// TODO Auto-generated method stub

	}

	@Override
	public ProtocolVersion getProtocolVersion() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public boolean containsHeader(String name) {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public Header[] getHeaders(String name) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Header getFirstHeader(String name) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Header getLastHeader(String name) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Header[] getAllHeaders() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void addHeader(Header header) {
		// TODO Auto-generated method stub

	}

	@Override
	public void addHeader(String name, String value) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setHeader(Header header) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setHeader(String name, String value) {
		// TODO Auto-generated method stub

	}

	@Override
	public void setHeaders(Header[] headers) {
		// TODO Auto-generated method stub

	}

	@Override
	public void removeHeader(Header header) {
		// TODO Auto-generated method stub

	}

	@Override
	public void removeHeaders(String name) {
		// TODO Auto-generated method stub

	}

	@Override
	public HeaderIterator headerIterator() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HeaderIterator headerIterator(String name) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public HttpParams getParams() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setParams(HttpParams params) {
		// TODO Auto-generated method stub

	}

	@Override
	public void close() throws IOException {
		// TODO Auto-generated method stub
	}
}
