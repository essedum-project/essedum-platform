package com.lfn.icip.icipwebeditor.v1.factory;

import com.lfn.icip.icipwebeditor.v1.service.IICIPSearchable;

public interface IICIPSearchableFactory {

IICIPSearchable getSearchableServiceUtil(String name);
}
