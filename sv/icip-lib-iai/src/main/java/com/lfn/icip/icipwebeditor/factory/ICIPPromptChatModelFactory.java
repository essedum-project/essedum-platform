package com.lfn.icip.icipwebeditor.factory;

import com.lfn.icip.icipwebeditor.service.ICIPPromptChatModel;

public interface ICIPPromptChatModelFactory {
	ICIPPromptChatModel getpromptchatModelobject(String name);
	

}
