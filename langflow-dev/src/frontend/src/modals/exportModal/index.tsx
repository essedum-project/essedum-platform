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

const ExportModal = forwardRef(
  (
    props: {
      children?: ReactNode;
      open?: boolean;
      setOpen?: (open: boolean) => void;
      flowData?: FlowType;
    },
    ref,
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
      currentFlow?.description ?? "",
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
    // Get authentication token - prioritize access_token_lf, fallback to others
    const access_token_lf = localStorage.getItem("access_token_lf");
    const authToken = access_token_lf;
    
    // Static values as per curl example
    const projectId = "2";
    const projectName = "leo1311";
    const roleId = "1";
    const roleName = "IT Portfolio Manager";

    const apiUrl = "/api/aip/langflow/langflow_export"; // This will be proxied by Vite to port 8081

    // Build headers to match the working curl request
    const headers: Record<string, string> = {
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Connection": "keep-alive",
      "Content-Type": "application/json",
      "X-Requested-With": "Leap",
      "charset": "utf-8",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
    };
    
    // Add authentication and project headers
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }
    if (projectId) headers["Project"] = String(projectId);
    if (projectName) headers["ProjectName"] = String(projectName);
    if (roleId) headers["roleId"] = String(roleId);
    if (roleName) headers["roleName"] = String(roleName);

    console.log("Making API request to:", apiUrl);
    console.log("Headers:", headers);

    const resp = await fetch(apiUrl, { 
      method: "GET", 
      headers, 
      credentials: "include",
      mode: "cors"
    });
    
    const text = await resp.text().catch(() => null);
    
    if (!resp.ok) {
      console.error(`API failed: ${resp.status} ${resp.statusText}`, text);
      throw new Error(`API failed: ${resp.status} ${text || resp.statusText}`);
    }

    console.log("API response received successfully");

    if (checked) {
      const payload = { 
        id: currentFlow!.id, 
        data: currentFlow!.data!, 
        description, 
        name, 
        last_tested_version: version, 
        endpoint_name: currentFlow!.endpoint_name, 
        is_component: false, 
        tags: currentFlow!.tags, 
        parentToken: authToken 
      };
      await downloadFlow(payload, name!, description);
      setNoticeData({ title: API_WARNING_NOTICE_ALERT });
    } else {
      const cleaned = removeApiKeys({ 
        id: currentFlow!.id, 
        data: currentFlow!.data!, 
        description, 
        name, 
        last_tested_version: version, 
        endpoint_name: currentFlow!.endpoint_name, 
        is_component: false, 
        tags: currentFlow!.tags 
      });
      await downloadFlow(cleaned, name!, description);
      setSuccessData({ title: "Flow exported successfully" });
    }

    setOpen(false);
    track("Flow Exported", { flowId: currentFlow!.id });
  } catch (error) {
    console.error("Export failed:", error);
    setNoticeData({ title: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
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
                  // Build FormData with flow JSON and meta
                  const flowPayload = checked
                    ? { id: currentFlow!.id, data: currentFlow!.data!, description, name, last_tested_version: version, endpoint_name: currentFlow!.endpoint_name, is_component: false, tags: currentFlow!.tags }
                    : removeApiKeys({ id: currentFlow!.id, data: currentFlow!.data!, description, name, last_tested_version: version, endpoint_name: currentFlow!.endpoint_name, is_component: false, tags: currentFlow!.tags });

                  const jsonString = JSON.stringify(flowPayload);
                  const blob = new Blob([jsonString], { type: 'application/json' });

                  const form = new FormData();
                  form.append('json', blob, `${(name || 'flow')}.json`);
                  form.append('name', name ?? 'flow');
                  form.append('details', description ?? 'exported from ui');

                  const access_token_lf = localStorage.getItem('access_token_lf') || '';

                  const resp = await fetch('/api/aip/langflow/langflow_export_2', {
                    method: 'POST',
                    body: form,
                    credentials: 'include',
                    headers: access_token_lf ? { Authorization: `Bearer ${access_token_lf}` } : undefined,
                  });

                  const data = await resp.json().catch(() => null);
                  if (!resp.ok) {
                    console.error('Export to DB failed', resp.status, data);
                    setNoticeData({ title: `Export to DB failed: ${resp.status}` });
                    return;
                  }

                  setSuccessData({ title: 'Exported to DB successfully' });
                  setOpen(false);
                } catch (err) {
                  console.error('Export to DB error', err);
                  setNoticeData({ title: 'Export to DB failed' });
                }
              }}
            >
              Export to DB
            </Button>
          </div>
        </BaseModal.Footer>
      </BaseModal>
    );
  },
);
export default ExportModal;
