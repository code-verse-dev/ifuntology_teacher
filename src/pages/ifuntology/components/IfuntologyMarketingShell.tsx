import "../styles/ifuntology-marketing.css";

export default function IfuntologyMarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ifuntology-marketing -mx-4 -mt-8 -mb-10 min-h-[calc(100vh-3.5rem)] overflow-x-hidden sm:-mx-6">
      <div className="ifi-page mx-auto max-w-[1180px] space-y-5 px-4 py-5 sm:space-y-6 sm:px-5 sm:py-6">
        {children}
      </div>
    </div>
  );
}
