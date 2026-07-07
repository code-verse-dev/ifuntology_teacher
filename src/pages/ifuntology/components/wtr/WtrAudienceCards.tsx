import AudienceFeatureCards, {
  type AudienceCardItem,
} from "../audience/AudienceFeatureCards";

const wtrAudienceCards: AudienceCardItem[] = [
  {
    title: "For Teachers",
    image: "wtr-3.png",
    imageAlt: "Teacher instructor character",
    features: [
      "Invite & manage students and batches",
      "Grade books & provide feedback",
      "Approve print requests & manage ISBNs",
      "Access lesson plans, view reports and billing",
    ],
    borderClassName: "border-emerald-500/40",
    titleClassName: "text-emerald-400",
    checkBgClassName: "bg-emerald-500/20 text-emerald-400",
    checkIconClassName: "text-emerald-400",
    buttonClassName: "green-button",
    characterPosition: "left",
    aosAnimation: "fade-right",
  },
  {
    title: "For Students",
    image: "wtr-4.png",
    imageAlt: "Student character",
    features: [
      "Create, design & illustrate your books",
      "Add avatars & ISBNs to your book",
      "Save, download or share eBooks",
      "Request, print, track status & earn certificates",
    ],
    borderClassName: "border-orange-500/40",
    titleClassName: "text-orange-400",
    checkBgClassName: "bg-orange-500/20 text-orange-400",
    checkIconClassName: "text-orange-400",
    buttonClassName: "orange-button",
    characterPosition: "right",
    aosAnimation: "fade-left",
  },
];

export default function WtrAudienceCards() {
  return <AudienceFeatureCards cards={wtrAudienceCards} />;
}
