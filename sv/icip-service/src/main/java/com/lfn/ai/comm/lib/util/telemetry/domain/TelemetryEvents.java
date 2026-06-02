package com.lfn.ai.comm.lib.util.telemetry.domain;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
//import lombok.EqualsAndHashCode;
//import lombok.Getter;
//import lombok.Setter;
//import lombok.ToString;

//@Getter
//@Setter
//@ToString
//@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@Entity
@Table(name = "telemetry_impressions")
public class TelemetryEvents {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String eid;
	private Long ets;
	private String ver;
	private String mid;

	private String actor_id;
	private String actor_type;

	private String context_channel;
	private String context_pdata_id;
	private String context_pdata_ver;
	private String context_pdata_pid;

	private String object_id;
	private String object_ver;

	private String edata_type;
	private String edata_id;
	private String edata_pageid;
	private String edata_subType;
	private String edata_stageto;
	private Double edata_duration;
	private String edata_state_user_login;
	private String edata_state_user_email;
	private Boolean edata_state_onboarded;
	private Boolean edata_state_activated;
	private Boolean edata_state_user_act_ind;
	private String edata_state_user_f_name;
	private String edata_state_user_l_name;
	private Boolean edata_state_force_password_change;
	private String edata_state_country;
	private String edata_state_timezone;
	private String edata_state_contact_number;
	private Boolean edata_state_isUiInactivityTracked;
	private String edata_prevstate;

	private LocalDateTime ets_datetime;

	@Lob
	private String json_data; // To store the entire JSON

	// Getters and Setters

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getEid() {
		return eid;
	}

	public void setEid(String eid) {
		this.eid = eid;
	}

	public Long getEts() {
		return ets;
	}

	public void setEts(Long ets) {
		this.ets = ets;
	}

	public String getVer() {
		return ver;
	}

	public void setVer(String ver) {
		this.ver = ver;
	}

	public String getMid() {
		return mid;
	}

	public void setMid(String mid) {
		this.mid = mid;
	}

	public String getActor_id() {
		return actor_id;
	}

	public void setActor_id(String actor_id) {
		this.actor_id = actor_id;
	}

	public String getActor_type() {
		return actor_type;
	}

	public void setActor_type(String actor_type) {
		this.actor_type = actor_type;
	}

	public String getContext_channel() {
		return context_channel;
	}

	public void setContext_channel(String context_channel) {
		this.context_channel = context_channel;
	}

	public String getContext_pdata_id() {
		return context_pdata_id;
	}

	public void setContext_pdata_id(String context_pdata_id) {
		this.context_pdata_id = context_pdata_id;
	}

	public String getContext_pdata_ver() {
		return context_pdata_ver;
	}

	public void setContext_pdata_ver(String context_pdata_ver) {
		this.context_pdata_ver = context_pdata_ver;
	}

	public String getContext_pdata_pid() {
		return context_pdata_pid;
	}

	public void setContext_pdata_pid(String context_pdata_pid) {
		this.context_pdata_pid = context_pdata_pid;
	}

	public String getObject_id() {
		return object_id;
	}

	public void setObject_id(String object_id) {
		this.object_id = object_id;
	}

	public String getObject_ver() {
		return object_ver;
	}

	public void setObject_ver(String object_ver) {
		this.object_ver = object_ver;
	}

	public String getEdata_type() {
		return edata_type;
	}

	public void setEdata_type(String edata_id) {
		this.edata_type = edata_id;
	}

	public String getEdata_id() {
		return edata_id;
	}

	public void setEdata_id(String edata_id) {
		this.edata_id = edata_id;
	}

	public String getEdata_pageid() {
		return edata_pageid;
	}

	public void setEdata_pageid(String edata_pageid) {
		this.edata_pageid = edata_pageid;
	}

	public String getEdata_subType() {
		return edata_subType;
	}

	public void setEdata_subType(String edata_subType) {
		this.edata_subType = edata_subType;
	}

	public String getEdata_stageto() {
		return edata_stageto;
	}

	public void setEdata_stageto(String edata_stageto) {
		this.edata_stageto = edata_stageto;
	}

	public Double getEdata_duration() {
		return edata_duration;
	}

	public void setEdata_duration(Double edata_duration) {
		this.edata_duration = edata_duration;
	}

	public String getEdata_state_user_login() {
		return edata_state_user_login;
	}

	public void setEdata_state_user_login(String edata_state_user_login) {
		this.edata_state_user_login = edata_state_user_login;
	}

	public String getEdata_state_user_email() {
		return edata_state_user_email;
	}

	public void setEdata_state_user_email(String edata_state_user_email) {
		this.edata_state_user_email = edata_state_user_email;
	}

	public Boolean getEdata_state_onboarded() {
		return edata_state_onboarded;
	}

	public void setEdata_state_onboarded(Boolean edata_state_onboarded) {
		this.edata_state_onboarded = edata_state_onboarded;
	}

	public Boolean getEdata_state_activated() {
		return edata_state_activated;
	}

	public void setEdata_state_activated(Boolean edata_state_activated) {
		this.edata_state_activated = edata_state_activated;
	}

	public Boolean getEdata_state_user_act_ind() {
		return edata_state_user_act_ind;
	}

	public void setEdata_state_user_act_ind(Boolean edata_state_user_act_ind) {
		this.edata_state_user_act_ind = edata_state_user_act_ind;
	}

	public String getEdata_state_user_f_name() {
		return edata_state_user_f_name;
	}

	public void setEdata_state_user_f_name(String edata_state_user_f_name) {
		this.edata_state_user_f_name = edata_state_user_f_name;
	}

	public String getEdata_state_user_l_name() {
		return edata_state_user_l_name;
	}

	public void setEdata_state_user_l_name(String edata_state_user_l_name) {
		this.edata_state_user_l_name = edata_state_user_l_name;
	}

	public Boolean getEdata_state_force_password_change() {
		return edata_state_force_password_change;
	}

	public void setEdata_state_force_password_change(Boolean edata_state_force_password_change) {
		this.edata_state_force_password_change = edata_state_force_password_change;
	}

	public String getEdata_state_country() {
		return edata_state_country;
	}

	public void setEdata_state_country(String edata_state_country) {
		this.edata_state_country = edata_state_country;
	}

	public String getEdata_state_timezone() {
		return edata_state_timezone;
	}

	public void setEdata_state_timezone(String edata_state_timezone) {
		this.edata_state_timezone = edata_state_timezone;
	}

	public String getEdata_state_contact_number() {
		return edata_state_contact_number;
	}

	public void setEdata_state_contact_number(String edata_state_contact_number) {
		this.edata_state_contact_number = edata_state_contact_number;
	}

	public Boolean getEdata_state_isUiInactivityTracked() {
		return edata_state_isUiInactivityTracked;
	}

	public void setEdata_state_isUiInactivityTracked(Boolean edata_state_isUiInactivityTracked) {
		this.edata_state_isUiInactivityTracked = edata_state_isUiInactivityTracked;
	}

	public String getEdata_prevstate() {
		return edata_prevstate;
	}

	public void setEdata_prevstate(String edata_prevstate) {
		this.edata_prevstate = edata_prevstate;
	}

	public LocalDateTime getEts_datetime() {
		return ets_datetime;
	}

	public void setEts_datetime(LocalDateTime ets_datetime) {
		this.ets_datetime = ets_datetime;
	}

	public String getJson_data() {
		return json_data;
	}

	public void setJson_data(String json_data) {
		this.json_data = json_data;
	}

	@Override
	public String toString() {
	    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
	    return "TelemetryEvents{" +
	            "id=" + id +
	            ", eid='" + eid + '\'' +
	            ", ets=" + ets +
	            ", ver='" + ver + '\'' +
	            ", mid='" + mid + '\'' +
	            ", actor_id='" + actor_id + '\'' +
	            ", actor_type='" + actor_type + '\'' +
	            ", context_channel='" + context_channel + '\'' +
	            ", context_pdata_id='" + context_pdata_id + '\'' +
	            ", context_pdata_ver='" + context_pdata_ver + '\'' +
	            ", context_pdata_pid='" + context_pdata_pid + '\'' +
	            ", object_id='" + object_id + '\'' +
	            ", object_ver='" + object_ver + '\'' +
	            ", edata_type='" + edata_type + '\'' +
	            ", edata_id='" + edata_id + '\'' +
	            ", edata_pageid='" + edata_pageid + '\'' +
	            ", edata_subType='" + edata_subType + '\'' +
	            ", edata_stageto='" + edata_stageto + '\'' +
	            ", edata_duration=" + edata_duration +
	            ", ets_datetime=" + ets_datetime.format(formatter) +
	            ", json_data='" + json_data + '\'' +
	            ", edata_state_user_login='" + edata_state_user_login + '\'' +
	            ", edata_state_user_email='" + edata_state_user_email + '\'' +
	            ", edata_state_onboarded='" + edata_state_onboarded + '\'' +
	            ", edata_state_activated='" + edata_state_activated + '\'' +
	            ", edata_state_user_act_ind='" + edata_state_user_act_ind + '\'' +
	            ", edata_state_user_f_name='" + edata_state_user_f_name + '\'' +
	            ", edata_state_user_l_name='" + edata_state_user_l_name + '\'' +
	            ", edata_state_force_password_change='" + edata_state_force_password_change + '\'' +
	            ", edata_state_country='" + edata_state_country + '\'' +
	            ", edata_state_timezone='" + edata_state_timezone + '\'' +
	            ", edata_state_contact_number='" + edata_state_contact_number + '\'' +
	            ", edata_state_isUiInactivityTracked='" + edata_state_isUiInactivityTracked + '\'' +
	            ", edata_prevstate='" + edata_prevstate + '\'' +
	            '}';
	}
}
