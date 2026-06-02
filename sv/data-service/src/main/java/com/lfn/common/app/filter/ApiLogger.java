package com.lfn.common.app.filter;

import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.HandlerInterceptor;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class ApiLogger implements HandlerInterceptor {

	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		String requestId = UUID.randomUUID().toString();
		log(request, response, requestId);
		long startTime = System.currentTimeMillis();
		request.setAttribute("startTime", startTime);
		request.setAttribute("requestId", requestId);
		return true;
	}

	@Override
	public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
			throws Exception {
		long startTime = (Long) request.getAttribute("startTime");
		long endTime = System.currentTimeMillis();
		long executeTime = endTime - startTime;
		log.info("requestId {}, Handle :{} , request take time: {}", request.getAttribute("requestId"), handler,
				executeTime);
	}

	private void log(HttpServletRequest request, HttpServletResponse response, String requestId) {
		log.info("requestId {}, host {}  HttpMethod: {}, URI : {}", requestId, request.getHeader("host"),
				request.getMethod(), request.getRequestURI());
	}
}