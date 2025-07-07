package com.infosys.icets.icip.icipwebeditor.v1.factory;

import com.infosys.icets.icip.icipwebeditor.v1.service.IICIPSearchable;

public interface IICIPSearchableFactory {

IICIPSearchable getSearchableServiceUtil(String name);
}
