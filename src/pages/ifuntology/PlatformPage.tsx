import EverythingConnects from "./components/EverythingConnects";
import InnerBanner from "./components/InnerBanner";
import PlatformModules from "./components/platformModules";
import type { PlatformModuleItem } from "./components/platformModules/PlatformModuleCard";
import IfuntologyPageLayout from "./IfuntologyPageLayout";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Handshake,
  PenLine,
  ShoppingCart,
} from "lucide-react";

const ERP_PLATFORM = "https://ifuntology.com";

const platformModules: PlatformModuleItem[] = [
  {
    icon: BookOpen,
    iconClassName: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    accentBarClassName: "bg-emerald-500",
    badge: "LMS",
    badgeClassName: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
    title: "Learning Management",
    description:
      "Create structured courses, manage curricula, handle student enrollments, issue certificates, and track learning outcomes in real time.",
    href: `${ERP_PLATFORM}/platform/lms`,
  },
  {
    icon: ShoppingCart,
    iconClassName: "bg-gradient-to-br from-orange-400 to-orange-600",
    accentBarClassName: "bg-orange-500",
    badge: "SHOP",
    badgeClassName: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
    title: "E-Commerce Store",
    description:
      "Sell digital products, physical goods, courses, and memberships. Built-in cart, payments, discounts, and inventory management.",
    href: `${ERP_PLATFORM}/platform/e-commerce`,
  },
  {
    icon: Calendar,
    iconClassName: "bg-gradient-to-br from-sky-400 to-blue-600",
    accentBarClassName: "bg-sky-500",
    badge: "BOOK",
    badgeClassName: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30",
    title: "Booking & Scheduling",
    description:
      "Let students book 1-on-1 sessions, group classes, workshops, and live events. Automated reminders and calendar sync included.",
    href: `${ERP_PLATFORM}/platform/booking`,
  },
  {
    icon: PenLine,
    iconClassName: "bg-gradient-to-br from-purple-400 to-purple-600",
    accentBarClassName: "bg-purple-500",
    badge: "PUBLISH",
    badgeClassName: "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30",
    title: "Write to Read Publishing",
    description:
      "Integrated publishing engine for creating, distributing, and monetizing written content and digital books.",
    href: "/ifuntology/write-to-read",
  },
  {
    icon: Handshake,
    iconClassName: "bg-gradient-to-br from-teal-400 to-teal-600",
    accentBarClassName: "bg-teal-500",
    badge: "AFFILIATE",
    badgeClassName: "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/30",
    title: "Affiliate Management",
    description:
      "Full affiliate program management: recruit partners, track referrals, manage commissions, and grow your reach organically.",
    href: `${ERP_PLATFORM}/platform/affiliates`,
  },
  {
    icon: BarChart3,
    iconClassName: "bg-gradient-to-br from-pink-400 to-pink-600",
    accentBarClassName: "bg-pink-500",
    badge: "ANALYTICS",
    badgeClassName: "bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/30",
    title: "Analytics & Reporting",
    description:
      "Deep insights into revenue, student performance, course completion, booking rates, and marketing effectiveness.",
    href: `${ERP_PLATFORM}/platform/analytics`,
  },
];

const connectionSteps = [
  { label: "LMS", colorClassName: "text-emerald-400" },
  { label: "E-Commerce", colorClassName: "text-orange-400" },
  { label: "Booking", colorClassName: "text-sky-400" },
  { label: "Publishing", colorClassName: "text-purple-400" },
  { label: "Analytics", colorClassName: "text-pink-400" },
];

export default function IfuntologyPlatformPage() {
  return (
    <IfuntologyPageLayout title="What We Offer">
      <div className="flex flex-col gap-5 sm:gap-6">
        <InnerBanner
          eyebrow="EVERYTHING IN ONE PLACE"
          title="The Complete Platform for Modern Learning"
          description="One integrated ERP combining LMS, e-commerce, publishing, booking, and affiliate tools — all seamlessly connected for educators and organizations."
        />

        <PlatformModules modules={platformModules} />

        <EverythingConnects
          steps={connectionSteps}
          description="Data flows seamlessly between modules — student books a session, course unlocks automatically, purchase tracked in analytics."
        />
      </div>
    </IfuntologyPageLayout>
  );
}
