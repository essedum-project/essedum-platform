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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.lfn.ai.comm.lib.util.XSSUtils;

public class XSSRequestWrapper extends HttpServletRequestWrapper {

	private byte[] rawData;
	private HttpServletRequest request;
	private ResettableServletInputStream servletStream;

	private static final Logger logger = LoggerFactory.getLogger(XSSRequestWrapper.class);

	public XSSRequestWrapper(HttpServletRequest request) {
		super(request);
		this.request = request;
		try {
			this.servletStream = new ResettableServletInputStream();
		} finally {
			if (this.servletStream != null) {
				try {
					this.servletStream.close();
				} catch (IOException e) {
					logger.error("Unable to close stream");
				}
			}
		}
	}

	@Override
	public String[] getParameterValues(String parameter) {

		/* allowParamValue is added to accept xml's for btf workflows */
		String allowParamValue = "<\\?xml version=\"[1-9]\\.[0-9]\" encoding=\"UTF-8\".*\\?>\n<(bpmn[0-9]*:){0,1}definitions.*>[\\s\\S]*?</(bpmn[0-9]*:){0,1}definitions>";
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
		rawData = newRawData;
		servletStream.stream = new ByteArrayInputStream(newRawData);
	}

	@SuppressWarnings("unchecked")
	@Override
	public Enumeration getHeaders(String name) {

		List result = new ArrayList<>();
		Enumeration headers = super.getHeaders(name);

		while (headers.hasMoreElements()) {
			String header = (String) headers.nextElement();
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

		}
	}

}