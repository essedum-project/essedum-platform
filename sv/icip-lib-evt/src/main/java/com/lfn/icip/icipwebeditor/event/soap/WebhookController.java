package com.lfn.icip.icipwebeditor.event.soap;
//package com.lfn.iamp.app.web.soap;
//
//import java.net.URLDecoder;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.ws.server.endpoint.annotation.Endpoint;
//import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
//import org.springframework.ws.server.endpoint.annotation.RequestPayload;
//import org.springframework.ws.server.endpoint.annotation.ResponsePayload;
//
//import com.google.gson.Gson;
//import com.google.gson.JsonObject;
//import com.lfn.icip.icipwebeditor.service.IICIPEventJobMappingService;
//import com.lfn.icip.icipwebeditor.ws.GetWebhookRequest;
//import com.lfn.icip.icipwebeditor.ws.GetWebhookResponse;
//
//import lombok.extern.log4j.Log4j2;
//
//@Endpoint
//@Log4j2
//public class WebhookController {
//
//	private static final String NAMESPACE_URI = " ";
//
//	@Autowired
//	private IICIPEventJobMappingService eventMappingService;
//
//	@PayloadRoot(namespace = NAMESPACE_URI, localPart = "getWebhookRequest")
//	@ResponsePayload
//	public GetWebhookResponse getCountry(@RequestPayload GetWebhookRequest request) {
//		try {
//			Gson gson = new Gson();
//			String params = request.getParam();
//			String name = request.getName();
//			String org = request.getOrg();
//			String corelid = request.getCorelid();
//			params = URLDecoder.decode(params, "UTF-8");
//			if (params == null || params.trim().equalsIgnoreCase("null") || params.trim().isEmpty()) {
//				params = "{}";
//			}
//			JsonObject json = gson.fromJson(params, JsonObject.class);
////			json.addProperty("data", payload);
//			params = gson.toJson(json);
//			String message = eventMappingService.trigger(name, org, corelid, params);
//			GetWebhookResponse response = new GetWebhookResponse();
//			response.setMessage(message);
//			return response;
//		} catch (Exception e) {
//			log.error(e.getMessage(), e);
//			GetWebhookResponse response = new GetWebhookResponse();
//			response.setMessage("Triggering Error!");
//			return response;
//		}
//	}
//
//}
//}

