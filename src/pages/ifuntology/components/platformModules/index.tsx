import PlatformModuleCard, {
  type PlatformModuleItem,
} from "./PlatformModuleCard";
import SectionHeader from "../SectionHeader";

interface PlatformModulesProps {
  eyebrow?: string;
  title?: string;
  modules: PlatformModuleItem[];
}

export default function PlatformModules({
  eyebrow = "CORE MODULES",
  title = "Platform Modules",
  modules,
}: PlatformModulesProps) {
  return (
    <section className="ifi-card p-6 sm:p-8">
      <SectionHeader eyebrow={eyebrow} title={title} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
        {modules.map((m, i) => (
          <PlatformModuleCard key={m.title} item={m} staggerIndex={i} />
        ))}
      </div>
    </section>
  );
}
