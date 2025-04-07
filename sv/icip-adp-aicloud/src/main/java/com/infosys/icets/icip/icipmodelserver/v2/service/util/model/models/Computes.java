package com.infosys.icets.icip.icipmodelserver.v2.service.util.model.models;

import javax.annotation.processing.Generated;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import lombok.Getter;
import lombok.Setter;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "type",
    "maxQty",
    "memory",
    "minQty"    
})
@Getter
@Setter
@Generated("jsonschema2pojo")
public class Computes {
    private String type;
    private Integer maxQty;
    private String memory;
    private Integer minQty;
//    public String getType() {
//        return type;
//    }
//    public void setType(String type) {
//        this.type = type;
//    }
//    public Integer getMaxQty() {
//        return maxQty;
//    }
//    public void setMaxQty(Integer maxQty) {
//        this.maxQty = maxQty;
//    }
//    public String getMemory() {
//        return memory;
//    }
//    public void setMemory(String memory) {
//        this.memory = memory;
//    }
//    public Integer getMinQty() {
//        return minQty;
//    }
//    public void setMinQty(Integer minQty) {
//        this.minQty = minQty;
//    }
}