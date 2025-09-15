package com.lfn.common.app.filter;

import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(value = Ordered.HIGHEST_PRECEDENCE)
public class XSSFilter implements Filter {

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		XSSRequestWrapper wrappedRequest = new XSSRequestWrapper((HttpServletRequest) request);
		chain.doFilter(wrappedRequest, response);
	}

	// other methods
}