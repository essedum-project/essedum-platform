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
  post_agent_export_details,
  post_agent_export_file_details,
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
            {/* <Button
              variant="secondary"
              type="button"
              onClick={async () => {
                try {
                  const access_token_lf =
                    localStorage.getItem("access_token_lf") || undefined;
                  const result = await get_agent_export({
                    token: access_token_lf,
                  });
                  console.log("get_agent_export response", result);
                  setSuccessData({ title: "get_agent_export succeeded" });
                  setOpen(false);
                } catch (err) {
                  console.error("get_agent_export failed", err);
                  setNoticeData({
                    title: `get_agent_export failed: ${
                      err instanceof Error ? err.message : "Unknown error"
                    }`,
                  });
                }
              }}
            >
              Export to DB
            </Button> */}
          </div>
        </BaseModal.Footer>
      </BaseModal>
    );
  }
);
export default ExportModal;
