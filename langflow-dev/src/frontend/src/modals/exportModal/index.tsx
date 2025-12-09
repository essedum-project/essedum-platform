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

            setSuccessData({ title: "Exported to DB successfully" });
            setOpen(false);
          } catch (err) {
            console.error("Export to DB failed", err);
            setNoticeData({
              title: `Export to DB failed: ${
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
          submit={{
            label: "Export",
            loading: isBuilding,
            dataTestId: "modal-export-button",
          }}
        >
          <div className="flex items-center">
            <Button
              variant="secondary"
              type="button"
              onClick={async () => {
                try {
                  const access_token_lf =
                    localStorage.getItem("access_token_lf") || undefined;

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
                    type: 'AIAgent', // Default type, can be made configurable
                    interfaceType: 'pipeline',
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
                  const scriptBlob = new Blob([actualFlowScript], { type: 'application/json' });
                  scriptFormData.set('scriptFile', scriptBlob);

                  const scriptFileName = `${cname}_${name || 'flow'}.json`; // Use cname from sessionStorage
                  const organization = 'leo1311'; // Default organization

                  console.log("Calling create_native_file...");
                 

                  const nativeFileResponse = await create_native_file({
                    pipelineName: sessionStorage.getItem('cname') || "", // Use cname from sessionStorage
                    organization,
                    fileName: scriptFileName,
                    fileType: 'json', // Default file type
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
                        arguments: [],
                        dsName: 'LEOMN-RM22869',
                        type: 'REMOTE'
                      }
                    }],
                    environment: [],
                    default_runtime: { dsAlias: 'Sample-Remote', dsName: 'LEOMN-RM22869', type: 'REMOTE' }
                  });

                  const updatePayload = {
                    cid: result.cid,
                    alias: name || 'flow',
                    name: cname,
                    description: description || 'Exported from Langflow UI',
                    jsonContent: jsonContent,
                    type: 'AIAgent',
                    organization: 'leo1311',
                    interfacetype: 'pipeline',
                    isTemplate: false,
                    token: access_token_lf,
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
                  
                  setSuccessData({ title: "Pipeline saved to DB and downloaded locally" });
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
              Export to DB
            </Button>
          </div>
        </BaseModal.Footer>
      </BaseModal>
    );
  }
);
export default ExportModal;
