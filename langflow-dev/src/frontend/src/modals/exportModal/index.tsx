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
          
       
        </BaseModal.Content>

        <BaseModal.Footer
        >
          <div className="flex items-center">

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
                    description: description || 'Exported to Essedum',
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
                      description: description || 'Exported to Essedum',
                      jsonContent: jsonContent,
                      type: agentType,
                      organization: organization,
                      interfacetype: interfaceType,
                      isTemplate: false,
                      token: access_token_lf,
                    });

                    setSuccessData({ title: "Agent flow exported to essedum successfully" });
                  } else {
                    setSuccessData({ title: "Agent flow created to essedum successfully" });
                  }
                  
                  setOpen(false);
                } catch (err) {
                  console.error("EXPORT_LANG_ESSEDUM failed", err);
                  setNoticeData({
                    title: `Agent flow export to essedum failed: ${
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