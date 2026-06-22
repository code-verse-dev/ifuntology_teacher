import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { aosData, aosStaggerDelay } from "../../utils/aosData";

export interface PlatformModuleItem {
  icon: LucideIcon;
  iconClassName: string;
  accentBarClassName: string;
  badge: string;
  badgeClassName: string;
  title: string;
  description: string;
  href?: string;
}

interface PlatformModuleCardProps {
  item: PlatformModuleItem;
  staggerIndex?: number;
}

export default function PlatformModuleCard({
  item,
  staggerIndex = 0,
}: PlatformModuleCardProps) {
  const {
    icon: Icon,
    iconClassName,
    accentBarClassName,
    badge,
    badgeClassName,
    title,
    description,
    href = "https://erp.ifuntology.com/platform",
  } = item;

  const linkClass =
    "text-gradient-green mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold no-underline transition hover:gap-2";

  return (
    <div
      className="ifi-module-card h-full"
      {...aosData("fade-up", { delay: aosStaggerDelay(staggerIndex, 68) })}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accentBarClassName}`} aria-hidden />

      <span
        className={`absolute right-4 top-4 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClassName}`}
      >
        {badge}
      </span>

      <div
        className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg ${iconClassName}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
        {description}
      </p>

      {href.startsWith("http") ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <ArrowRight className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
          Learn more
        </a>
      ) : (
        <Link to={href} className={linkClass}>
          <ArrowRight className="h-4 w-4 text-emerald-400" strokeWidth={2.5} />
          Learn more
        </Link>
      )}
    </div>
  );
}
