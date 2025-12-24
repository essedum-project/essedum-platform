import { forwardRef, type ReactNode, useEffect, useState } from "react";
import { track } from "@/customization/utils/analytics";
import useFlowStore from "@/stores/flowStore";
import type { FlowType } from "@/types/flow";
import IconComponent from "../../components/common/genericIconComponent";
import EditFlowSettings from "../../components/core/editFlowSettingsComponent";
import { Checkbox } from "../../components/ui/checkbox";
import { API_WARNING_NOTICE_ALERT } from "../../constants/alerts_constants";
import {
  ALERT_SAVE_WITH_API,
  EXPORT_DIALOG_SUBTITLE,
  SAVE_WITH_API_CHECKBOX,
} from "../../constants/constants";
import useAlertStore from "../../stores/alertStore";
import { useDarkStore } from "../../stores/darkStore";
import { downloadFlow, removeApiKeys } from "../../utils/reactflowUtils";
import BaseModal from "../baseModal";
import { Button } from "../../components/ui/button";
import {
  create_pipeline,
  create_native_file,
  update_pipeline,
  export_lang_essedum_create_pipeline,
  export_lang_essedum_update_pipeline,
  export_lang_essedum_create_native_file,
} from "@/controllers/API/services/exportModelService";

const ExportModal = forwardRef(
  (
    props: {
      children?: ReactNode;
      open?: boolean;
      setOpen?: (open: boolean) => void;
      flowData?: FlowType;
    },
    ref
  ): JSX.Element => {
    const version = useDarkStore((state) => state.version);
    const setSuccessData = useAlertStore((state) => state.setSuccessData);
    const setNoticeData = useAlertStore((state) => state.setNoticeData);
    const [checked, setChecked] = useState(false);
    const currentFlowOnPage = useFlowStore((state) => state.currentFlow);
    const currentFlow = props.flowData ?? currentFlowOnPage;
    const isBuilding = useFlowStore((state) => state.isBuilding);
    useEffect(() => {
      setName(currentFlow?.name ?? "");
      setDescription(currentFlow?.description ?? "");
    }, [currentFlow?.name, currentFlow?.description]);
    const [name, setName] = useState(currentFlow?.name ?? "");
    const [description, setDescription] = useState(
      currentFlow?.description ?? ""
    );

    // Allow dynamic binding for type and interfacetype
    const [agentType, setAgentType] = useState<string>('AIAgent');
    const [interfaceType, setInterfaceType] = useState<string>('pipeline-agent');

    const [customOpen, customSetOpen] = useState(false);
    const [open, setOpen] =
      props.open !== undefined && props.setOpen !== undefined
        ? [props.open, props.setOpen]
        : [customOpen, customSetOpen];

    return (
      <BaseModal
        size="smaller-h-full"
        open={open}
        setOpen={setOpen}
        onSubmit={async () => {}}
          
             
      >
        <BaseModal.Trigger asChild>{props.children ?? <></>}</BaseModal.Trigger>
        <BaseModal.Header description={EXPORT_DIALOG_SUBTITLE}>
          <span className="pr-2">Export</span>
          <IconComponent
            name="Download"
            className="h-6 w-6 pl-1 text-foreground"
            aria-hidden="true"
          />
        </BaseModal.Header>
        <BaseModal.Content>
          <EditFlowSettings
            name={name}
            description={description}
            setName={setName}
            setDescription={setDescription}
          />
          <div className="mt-3 flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={checked}
              onCheckedChange={(event: boolean) => {
                setChecked(event);
              }}
            />
            <label htmlFor="terms" className="export-modal-save-api text-sm">
              {SAVE_WITH_API_CHECKBOX}
            </label>
          </div>
          <span className="mt-1 text-xs text-destructive">
            {ALERT_SAVE_WITH_API}
          </span>
          
          {/* Export Options Description */}
          {/* <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Export Options:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Export to Essedum:</strong> Direct export to Essedum platform</li>
              <li>• <strong>Export via Langflow Backend:</strong> Routes through Langflow backend first, then to Essedum</li>
            </ul>
          </div> */}
        </BaseModal.Content>

        <BaseModal.Footer
        >
          <div className="flex items-center">
            {/* <Button
              variant="default"
              type="button"
              onClick={async () => {
                try {
                  const access_token_lf =
                    localStorage.getItem("access_token_lf") || undefined;
                  const parentToken =
                    localStorage.getItem("baseParentToken") || undefined;

                  // Read userId from global session details (matching exportModelService parsing)
                  const _sessionData = sessionStorage.getItem('parentSessionDetails');
                  const _parsed = _sessionData ? JSON.parse(_sessionData) : null;
                  const userIdFromSession = _parsed?.userId || '';
                  // Build flow payload similar to Angular saveDetails
                  const flowPayload = checked
                    ? {
                        id: currentFlow!.id,
                        data: currentFlow!.data!,
                        description,
                        name,
                        last_tested_version: version,
                        endpoint_name: currentFlow!.endpoint_name,
                        is_component: false,
                        tags: currentFlow!.tags,
                      }
                    : removeApiKeys({
                        id: currentFlow!.id,
                        data: currentFlow!.data!,
                        description,
                        name,
                        last_tested_version: version,
                        endpoint_name: currentFlow!.endpoint_name,
                        is_component: false,
                        tags: currentFlow!.tags,
                      });


                  const result = await create_pipeline({
                    alias: name || 'flow',
                    description: description || 'Exported from Langflow UI',
                    type: agentType, // dynamic via binding
                    interfaceType: interfaceType, // dynamic via binding
                    isTemplate: false,
                    jsonContent: null,
                    groups: [],
                    token: access_token_lf,
                  });

                  const cname = result?.name;
                  sessionStorage.removeItem('cname');
                  
                  // Store cname globally in sessionStorage for later use
                  if (cname) {
                    sessionStorage.setItem('cname', cname);
                  }

                  // First API call: create_native_file (upload script file)
                  // Use the actual flow data instead of default script
                  const actualFlowScript = JSON.stringify(flowPayload, null, 2);

                  const scriptFormData = new FormData();
                  const scriptBlob = new Blob([actualFlowScript], { type: 'application/json' });
                  scriptFormData.set('scriptFile', scriptBlob);

                  const organization = localStorage.getItem("organization") || "";
                  const scriptFileName = `${cname}_${organization}.json`; // Use cname from sessionStorage

                  const nativeFileResponse = await create_native_file({
                    pipelineName: sessionStorage.getItem('cname') || "", // Use cname from sessionStorage
                    organization: organization,
                    fileName: scriptFileName,
                    fileType: 'json', // Default file type
                    scriptFormData,
                    token: access_token_lf,
                  });

                  if (!result.cid) {
                    setNoticeData({ title: "Failed to get pipeline ID for update" });
                    return;
                  }

                  // Third API call: update_pipeline (update the pipeline with file info)
                  const jsonContent = JSON.stringify({
                    elements: [{
                      attributes: {
                        filetype: 'json',
                        files: [scriptFileName],
                     
                      }
                    }],
                    });

                  const updatePayload = {
                    cid: result.cid,
                    alias: name || 'flow',
                    name: cname,
                    description: description || 'Exported from Langflow UI',
                    jsonContent: jsonContent,
                    type: agentType,
                    organization: organization,
                    interfacetype: interfaceType,
                    isTemplate: false,
                    token: access_token_lf,
                    userId: userIdFromSession,
                    parentToken: parentToken,
                  };

                  const updateResponse = await update_pipeline(updatePayload);
                  
                  // Also save to local like the regular export button
                  // downloadFlow(
                  //   flowPayload,
                  //   name ?? "flow",
                  //   description ?? ""
                  // ); 

                  // Close modal and show success after Essedum export
                  setSuccessData({ title: "Pipeline saved to Essedum successfully" });
                  setOpen(false);
                } catch (err) {
                  console.error("create_pipeline failed", err);
                  setNoticeData({
                    title: `Pipeline creation failed: ${
                      err instanceof Error ? err.message : "Unknown error"
                    }`,
                  });
                }
              }}
            >
              Export to Essedum.
            </Button>
             */}
            {/* New EXPORT_LANG_ESSEDUM Button */}
            <Button
              variant="default"
              type="button"
              className="ml-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-950"
              onClick={async () => {
                try {
                  const access_token_lf =
                    localStorage.getItem("access_token_lf") || undefined;

                  // Read session details
                  const _sessionData = sessionStorage.getItem('parentSessionDetails');
                  const _parsed = _sessionData ? JSON.parse(_sessionData) : null;

                  // Build flow payload similar to regular export
                  const flowPayload = checked
                    ? {
                        id: currentFlow!.id,
                        data: currentFlow!.data!,
                        description,
                        name,
                        last_tested_version: version,
                        endpoint_name: currentFlow!.endpoint_name,
                        is_component: false,
                        tags: currentFlow!.tags,
                      }
                    : removeApiKeys({
                        id: currentFlow!.id,
                        data: currentFlow!.data!,
                        description,
                        name,
                        last_tested_version: version,
                        endpoint_name: currentFlow!.endpoint_name,
                        is_component: false,
                        tags: currentFlow!.tags,
                      });

                  // Step 1: Create pipeline via Langflow backend (with json_content: null)
                  const createResult = await export_lang_essedum_create_pipeline({
                    alias: name || 'flow',
                    description: description || 'Exported from Langflow UI via Langflow Backend',
                    type: agentType,
                    interfaceType: interfaceType,
                    isTemplate: false,
                    jsonContent: null, // Initially null, will be updated in step 3
                    groups: [],
                    token: access_token_lf,
                  });

                  const cname = createResult?.essedum_response?.name;
                  if (cname) {
                    sessionStorage.setItem('cname', cname);
                  }

                  // Step 2: Create native file via Langflow backend  
                  if (createResult?.essedum_response?.cid) {
                    const actualFlowScript = JSON.stringify(flowPayload, null, 2);
                    const scriptFormData = new FormData();
                    const scriptBlob = new Blob([actualFlowScript], { type: 'application/json' });
                    scriptFormData.set('scriptFile', scriptBlob);

                    const organization = localStorage.getItem("organization") || "";
                    const scriptFileName = `${cname}_${organization}.json`;

                    const nativeFileResult = await export_lang_essedum_create_native_file({
                      pipelineName: cname || "",
                      organization: organization,
                      fileName: scriptFileName,
                      fileType: 'json',
                      scriptFormData,
                      token: access_token_lf,
                    });

                    // Step 3: Update pipeline with file info via Langflow backend
                    const jsonContent = JSON.stringify({
                      elements: [{
                        attributes: {
                          filetype: 'json',
                          files: [scriptFileName],
                        }
                      }],
                    });

                    const updateResult = await export_lang_essedum_update_pipeline({
                      cid: createResult.essedum_response.cid,
                      alias: name || 'flow',
                      name: cname,
                      description: description || 'Exported from Langflow UI via Langflow Backend',
                      jsonContent: jsonContent,
                      type: agentType,
                      organization: organization,
                      interfacetype: interfaceType,
                      isTemplate: false,
                      token: access_token_lf,
                    });

                    setSuccessData({ title: "Agent flow exported via Langflow Backend successfully" });
                  } else {
                    setSuccessData({ title: "Agent flow created via Langflow Backend successfully" });
                  }
                  
                  setOpen(false);
                } catch (err) {
                  console.error("EXPORT_LANG_ESSEDUM failed", err);
                  setNoticeData({
                    title: `Langflow Backend export failed: ${
                      err instanceof Error ? err.message : "Unknown error"
                    }`,
                  });
                }
              }}
            >
              {/* <IconComponent
                name="ArrowRight" 
                className="mr-1 h-4 w-4"
              /> */}
              {/* Export via Langflow Backend */}
              Export to Essedum
            </Button>
          </div>
        </BaseModal.Footer>
      </BaseModal>
    );
  }
);
export default ExportModal;