import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import "./style/classes.css";
import "./style/index.css";
import "./App.css";
import "./style/applies.css";
import App from "./customization/custom-App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(<App />);
reportWebVitals();


// Global message listener to capture parent token even before components mount
(() => {
  const handleMessage = (event: MessageEvent) => {
    try {
      const data = event.data;
      if (!data) return;

      const sendAck = (ack: any) => {
        try {
          const source = event.source as Window | null;
          if (source && typeof source.postMessage === "function") {
            source.postMessage(ack, event.origin || "*");
            return;
          }
          if (window.parent && window.parent !== window && typeof window.parent.postMessage === "function") {
            window.parent.postMessage(ack, "*");
            return;
          }
        } catch (err) {
          console.error("Global listener: failed sending ack:", err);
        }
      };

      // Handle token messages (SET_TOKEN, parent-token, token)
      if (data.type === "SET_TOKEN" || data.type === "parent-token" || data.type === "token") {
        const token = data.token ?? data.accessToken ?? null;
        localStorage.setItem("baseParentToken", token);
        const custom = new CustomEvent("PARENT_TOKEN", { detail: { token, origin: event.origin } });
        window.dispatchEvent(custom);
        sendAck({ type: "TOKEN_RECEIVED", status: "ok" } as const);
      }

      // Handle organisation messages
      if (data.type === "SET_ORGANISATION" ) {
        const organisation = data.organisation;
        console.log("Global listener: received SET_ORGANISATION", { organisation, fullMessage: data });
        localStorage.setItem("organization", organisation);
        const customOrg = new CustomEvent("PARENT_ORG", { detail: { organisation, origin: event.origin } });
        window.dispatchEvent(customOrg);
        sendAck({ type: "ORG_RECEIVED", status: "ok" } as const);
      }


      if (data.type === "SET_PARENT_SESSION") {
        try {
          const details = data.parentSessionDetails ?? null;
          console.log("Global listener extracted parentSessionDetails:", details);
          try {
            sessionStorage.setItem("parentSessionDetails", JSON.stringify(details));
          } catch (err) {
            console.warn("Failed to persist parentSessionDetails to storage", err);
          }

          const custom = new CustomEvent("PARENT_SESSION", { detail: { details, origin: event.origin } });
          window.dispatchEvent(custom);

          sendAck({ type: "PARENT_SESSION_RECEIVED", status: "ok" } as const);
        } catch (err) {
          console.error("Global listener failed handling SET_PARENT_SESSION:", err);
        }
      }
    } catch (err) {
      console.error("Global listener error:", err);
    }
  };

  window.addEventListener("message", handleMessage);
})();
