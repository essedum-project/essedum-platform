package com.lfn.common.app.filter;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;

import com.lfn.ai.comm.lib.util.XSSUtils;

public class XSSRequestWrapper extends HttpServletRequestWrapper {

	private ResettableServletInputStream servletStream;

	public XSSRequestWrapper(HttpServletRequest request) {
		super(request);
		this.servletStream = new ResettableServletInputStream();
	}

	// Returning null is intentional: the servlet getParameterValues contract uses null to signal an
	// absent parameter, which Spring relies on for @RequestParam(required=true) resolution.
	@SuppressWarnings("java:S1168")
	@Override
	public String[] getParameterValues(String parameter) {

		/* allowParamValue is added to accept xml's for btf workflows */
		String allowParamValue = "<\\?xml version=\"[1-9]\\.\\d\" encoding=\"UTF-8\"[^?]*\\?>\n<(?:bpmn\\d*:)?definitions[^>]*>[\\s\\S]*?</(?:bpmn\\d*:)?definitions>";
		String[] values = super.getParameterValues(parameter);
		if (values == null) {
			return null;
		}
		if (parameter.equalsIgnoreCase("xmlData") && values[0].matches(allowParamValue)) {
			return values;
		}
		int count = values.length;
		String[] encodedValues = new String[count];
		for (int i = 0; i < count; i++) {
			encodedValues[i] = XSSUtils.stripXSS(values[i]);
		}
		return encodedValues;
	}

	@Override
	public String getParameter(String parameter) {

		String value = super.getParameter(parameter);
		return XSSUtils.stripXSS(value);
	}

	public void resetInputStream(byte[] newRawData) {
		servletStream.stream = new ByteArrayInputStream(newRawData);
	}

	@Override
	public Enumeration<String> getHeaders(String name) {

		List<String> result = new ArrayList<>();
		Enumeration<String> headers = super.getHeaders(name);

		while (headers.hasMoreElements()) {
			String header = headers.nextElement();
			String[] tokens = header.split(",");
			for (String token : tokens) {
				result.add(XSSUtils.stripXSS(token));
			}
		}
		return Collections.enumeration(result);
	}

	private class ResettableServletInputStream extends ServletInputStream {

		private InputStream stream;

		@Override
		public int read() throws IOException {
			return stream.read();
		}

		@Override
		public boolean isFinished() {
			return false;
		}

		@Override
		public boolean isReady() {
			return false;
		}

		@Override
		public void setReadListener(ReadListener readListener) {
			// Non-blocking reads are not supported for this in-memory, resettable stream.
		}
	}

}