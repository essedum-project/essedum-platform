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
import { get_agent_export } from "@/controllers/API/services/exportModelService";
import {
  put_agent_export,
  post_agent_export_file_details,
  create_pipeline,
  create_native_file,
  update_pipeline,
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
        onSubmit={async () => {
          try {
            // Build FormData with flow JSON and meta
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

            const jsonString = JSON.stringify(flowPayload);
            const blob = new Blob([jsonString], { type: "application/json" });

            const form = new FormData();
            form.append("json", blob, `${name || "flow"}.json`);
            form.append("name", name ?? "flow");
            form.append("details", description ?? "exported from ui");

            const access_token_lf =
              localStorage.getItem("access_token_lf") || undefined;

            const resp = await put_agent_export({
              form,
              token: access_token_lf,
            });
            console.log("put_agent_export response", resp);


            try {
              let alias = `${name || 'flow'}.json`;
              let organization = 'leo1311';
              let loadFileName = `${organization}_${name || 'flow'}`;

              // Call the new file details export API
              const fileDetailsResp = await post_agent_export_file_details({
                token: access_token_lf,
                alias,
                loadFileName,
              });
              console.log('post_agent_export_file_details response', fileDetailsResp);
            } catch (err) {
              console.error("post_agent_export_file_details failed", err);
              // don't block the main flow; surface notice
              setNoticeData({
                title: `post_agent_export_file_details failed: ${
                  err instanceof Error ? err.message : "Unknown error"
                }`,
              });
            }

            setSuccessData({ title: "Exported to Essedum successfully" });
            setOpen(false);
          } catch (err) {
            console.error("Export to Essedum failed", err);
            setNoticeData({
              title: `Export to Essedum failed: ${
                err instanceof Error ? err.message : "Unknown error"
              }`,
            });
          }
        }}
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
        </BaseModal.Content>

        <BaseModal.Footer
        >
          <div className="flex items-center">
            <Button
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

                  // const jsonContent = JSON.stringify({
                  //   elements: [flowPayload], // Wrap in elements array like Angular does
                  // });

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

                  console.log("create_pipeline response", result);
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
                  // Match working curl exactly: Content-Type: text/plain and filename: "blob"
                  const scriptBlob = new Blob([actualFlowScript], { type: 'text/plain' });
                  const scriptFileName = `${cname}_${name || 'flow'}.json`;
                  const organization = 'leo1311'; // Default organization

                  // Match curl exactly: filename="blob" (not the actual filename)
                  scriptFormData.append('scriptFile', scriptBlob, 'blob');
                  
                  // Debug FormData contents
                  console.log("FormData contents:");
                  Array.from(scriptFormData.entries()).forEach(([key, value]) => {
                    console.log(`${key}:`, value);
                    // Use globalThis to access runtime constructors (cast to any) so TypeScript treats them as values
                    if (
                      typeof value === "object" &&
                      ((value instanceof (globalThis as any).File) || (value instanceof (globalThis as any).Blob))
                    ) {
                      console.log(`  - Type: ${ (value as Blob).type }`);
                      console.log(`  - Size: ${ (value as Blob).size }`);
                      if (value instanceof (globalThis as any).File) {
                        console.log(`  - Name: ${ (value as File).name }`);
                      }
                    }
                  });

                  console.log("Calling create_native_file...");
                  console.log("scriptFileName:", scriptFileName);
                  console.log("cname:", cname);
                  
                  // Try direct fetch to match curl exactly
                  console.log("Trying direct fetch approach...");
                  
                  const directUrl = `/api/aip/file/create/${cname}/${organization}/JSON?file=${scriptFileName}`;
                  const directHeaders = {
                    'Accept': 'application/json',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Authorization': `Bearer ${access_token_lf}`,
                    'Connection': 'keep-alive',
                    'Origin': 'http://localhost:3000',
                    'Project': '2',
                    'ProjectName': 'leo1311',
                    'Referer': 'http://localhost:3000/flows',
                    'X-Requested-With': 'Leap',
                    'roleId': '1',
                    'roleName': 'IT Portfolio Manager'
                  };
                  
                  console.log("Direct fetch URL:", directUrl);
                  console.log("Direct fetch headers:", directHeaders);

                  try {
                    const directResponse = await fetch(directUrl, {
                      method: 'POST',
                      headers: directHeaders,
                      body: scriptFormData,
                      credentials: 'include'
                    });
                    
                    const directText = await directResponse.text();
                    console.log("Direct fetch response:", directResponse.status, directText);
                    
                    if (directResponse.ok) {
                      console.log("Direct fetch SUCCESS!");
                    } else {
                      console.error("Direct fetch failed:", directResponse.status, directText);
                    }
                  } catch (directErr) {
                    console.error("Direct fetch error:", directErr);
                  }
                 
                  // Also try the service method
                  const nativeFileResponse = await create_native_file({
                    pipelineName: sessionStorage.getItem('cname') || "", // Use cname from sessionStorage
                    organization,
                    fileName: scriptFileName,
                    fileType: 'JSON', // Uppercase to match server expectations
                    scriptFormData,
                    token: access_token_lf,
                  });
                  console.log("create_native_file response", nativeFileResponse);

                  if (!result.cid) {
                    console.error("No id in create_pipeline response, cannot update");
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
                    organization: 'leo1311',
                    interfacetype: interfaceType,
                    isTemplate: false,
                    token: access_token_lf,
                    userId: userIdFromSession,
                    parentToken: parentToken,
                  };
                  console.log("update_pipeline payload", updatePayload);

                  const updateResponse = await update_pipeline(updatePayload);
                  console.log("update_pipeline response", updateResponse);
                  
                  // Also save to local like the regular export button
                  downloadFlow(
                    flowPayload,
                    name ?? "flow",
                    description ?? ""
                  ); 

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
              Export to Essedum
            </Button>
          </div>
        </BaseModal.Footer>
      </BaseModal>
    );
  }
);
export default ExportModal;
