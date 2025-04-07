
package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "conversationID",
    "requestId",
    "requestTimestamp",
    "senderURI",
    "originatorURI",
    "userId",
    "security",
    "securityType"
})
@Generated("jsonschema2pojo")
public class Header {

    @JsonProperty("conversationID")
    private String conversationID;
    @JsonProperty("requestId")
    private String requestId;
    @JsonProperty("requestTimestamp")
    private String requestTimestamp;
    @JsonProperty("senderURI")
    private String senderURI;
    @JsonProperty("originatorURI")
    private String originatorURI;
    @JsonProperty("userId")
    private String userId;
    @JsonProperty("security")
    private String security;
    @JsonProperty("securityType")
    private String securityType;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("conversationID")
    public String getConversationID() {
        return conversationID;
    }

    @JsonProperty("conversationID")
    public void setConversationID(String conversationID) {
        this.conversationID = conversationID;
    }

    public Header withConversationID(String conversationID) {
        this.conversationID = conversationID;
        return this;
    }

    @JsonProperty("requestId")
    public String getRequestId() {
        return requestId;
    }

    @JsonProperty("requestId")
    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public Header withRequestId(String requestId) {
        this.requestId = requestId;
        return this;
    }

    @JsonProperty("requestTimestamp")
    public String getRequestTimestamp() {
        return requestTimestamp;
    }

    @JsonProperty("requestTimestamp")
    public void setRequestTimestamp(String requestTimestamp) {
        this.requestTimestamp = requestTimestamp;
    }

    public Header withRequestTimestamp(String requestTimestamp) {
        this.requestTimestamp = requestTimestamp;
        return this;
    }

    @JsonProperty("senderURI")
    public String getSenderURI() {
        return senderURI;
    }

    @JsonProperty("senderURI")
    public void setSenderURI(String senderURI) {
        this.senderURI = senderURI;
    }

    public Header withSenderURI(String senderURI) {
        this.senderURI = senderURI;
        return this;
    }

    @JsonProperty("originatorURI")
    public String getOriginatorURI() {
        return originatorURI;
    }

    @JsonProperty("originatorURI")
    public void setOriginatorURI(String originatorURI) {
        this.originatorURI = originatorURI;
    }

    public Header withOriginatorURI(String originatorURI) {
        this.originatorURI = originatorURI;
        return this;
    }

    @JsonProperty("userId")
    public String getUserId() {
        return userId;
    }

    @JsonProperty("userId")
    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Header withUserId(String userId) {
        this.userId = userId;
        return this;
    }

    @JsonProperty("security")
    public String getSecurity() {
        return security;
    }

    @JsonProperty("security")
    public void setSecurity(String security) {
        this.security = security;
    }

    public Header withSecurity(String security) {
        this.security = security;
        return this;
    }

    @JsonProperty("securityType")
    public String getSecurityType() {
        return securityType;
    }

    @JsonProperty("securityType")
    public void setSecurityType(String securityType) {
        this.securityType = securityType;
    }

    public Header withSecurityType(String securityType) {
        this.securityType = securityType;
        return this;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

    public Header withAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
        return this;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(Header.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("conversationID");
        sb.append('=');
        sb.append(((this.conversationID == null)?"<null>":this.conversationID));
        sb.append(',');
        sb.append("requestId");
        sb.append('=');
        sb.append(((this.requestId == null)?"<null>":this.requestId));
        sb.append(',');
        sb.append("requestTimestamp");
        sb.append('=');
        sb.append(((this.requestTimestamp == null)?"<null>":this.requestTimestamp));
        sb.append(',');
        sb.append("senderURI");
        sb.append('=');
        sb.append(((this.senderURI == null)?"<null>":this.senderURI));
        sb.append(',');
        sb.append("originatorURI");
        sb.append('=');
        sb.append(((this.originatorURI == null)?"<null>":this.originatorURI));
        sb.append(',');
        sb.append("userId");
        sb.append('=');
        sb.append(((this.userId == null)?"<null>":this.userId));
        sb.append(',');
        sb.append("security");
        sb.append('=');
        sb.append(((this.security == null)?"<null>":this.security));
        sb.append(',');
        sb.append("securityType");
        sb.append('=');
        sb.append(((this.securityType == null)?"<null>":this.securityType));
        sb.append(',');
        sb.append("additionalProperties");
        sb.append('=');
        sb.append(((this.additionalProperties == null)?"<null>":this.additionalProperties));
        sb.append(',');
        if (sb.charAt((sb.length()- 1)) == ',') {
            sb.setCharAt((sb.length()- 1), ']');
        } else {
            sb.append(']');
        }
        return sb.toString();
    }

    @Override
    public int hashCode() {
        int result = 1;
        result = ((result* 31)+((this.security == null)? 0 :this.security.hashCode()));
        result = ((result* 31)+((this.requestTimestamp == null)? 0 :this.requestTimestamp.hashCode()));
        result = ((result* 31)+((this.conversationID == null)? 0 :this.conversationID.hashCode()));
        result = ((result* 31)+((this.requestId == null)? 0 :this.requestId.hashCode()));
        result = ((result* 31)+((this.securityType == null)? 0 :this.securityType.hashCode()));
        result = ((result* 31)+((this.originatorURI == null)? 0 :this.originatorURI.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.senderURI == null)? 0 :this.senderURI.hashCode()));
        result = ((result* 31)+((this.userId == null)? 0 :this.userId.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Header) == false) {
            return false;
        }
        Header rhs = ((Header) other);
        return ((((((((((this.security == rhs.security)||((this.security!= null)&&this.security.equals(rhs.security)))&&((this.requestTimestamp == rhs.requestTimestamp)||((this.requestTimestamp!= null)&&this.requestTimestamp.equals(rhs.requestTimestamp))))&&((this.conversationID == rhs.conversationID)||((this.conversationID!= null)&&this.conversationID.equals(rhs.conversationID))))&&((this.requestId == rhs.requestId)||((this.requestId!= null)&&this.requestId.equals(rhs.requestId))))&&((this.securityType == rhs.securityType)||((this.securityType!= null)&&this.securityType.equals(rhs.securityType))))&&((this.originatorURI == rhs.originatorURI)||((this.originatorURI!= null)&&this.originatorURI.equals(rhs.originatorURI))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.senderURI == rhs.senderURI)||((this.senderURI!= null)&&this.senderURI.equals(rhs.senderURI))))&&((this.userId == rhs.userId)||((this.userId!= null)&&this.userId.equals(rhs.userId))));
    }

}
