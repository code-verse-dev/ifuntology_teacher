import React, { useEffect, useState } from "react";

export default function App() {
  const [status, setStatus] = useState("🚀 Starting...");

  useEffect(() => {
    async function load() {
      try {
        setStatus("1. Loading toaster...");
        await import("@/components/ui/toaster");

        setStatus("2. Loading sonner...");
        await import("@/components/ui/sonner");

        setStatus("3. Loading tooltip...");
        await import("@/components/ui/tooltip");

        setStatus("4. Loading next-themes...");
        await import("next-themes");

        setStatus("5. Loading cart...");
        await import("@/context/cart");

        setStatus("6. Loading react-router...");
        await import("react-router-dom");

        setStatus("7. Loading redux...");
        await import("react-redux");

        setStatus("8. Loading socket...");
        await import("@/config/socket");

        setStatus("9. Loading ActorPortalSessionSync...");
        await import("@/components/ActorPortalSessionSync");

        setStatus("10. Loading Functions...");
        await import("./utils/Functions");

        setStatus("11. Loading App.real...");
        const module = await import("./App.real");

        setStatus("✅ App.real loaded successfully");

        const RealApp = module.default;

        setTimeout(() => {
          document.body.innerHTML = "";
          const root = document.createElement("div");
          root.id = "root";
          document.body.appendChild(root);

          import("react-dom/client").then(({ createRoot }) => {
            createRoot(root).render(<RealApp />);
          });
        }, 1000);
      } catch (err: any) {
        setStatus(
          "❌ FAILED\n\n" +
            (err?.message || err?.toString() || "Unknown error")
        );
      }
    }

    load();
  }, []);

  return (
    <div
      style={{
        padding: "30px",
        fontSize: "22px",
        fontFamily: "Arial",
        whiteSpace: "pre-wrap",
        lineHeight: "1.8",
      }}
    >
      {status}
    </div>
  );
}