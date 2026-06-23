import WtrAudienceCards from "./components/wtr/WtrAudienceCards";
import WtrCta from "./components/wtr/WtrCta";
import WtrFeatureBar from "./components/wtr/WtrFeatureBar";
import WtrHero from "./components/wtr/WtrHero";
import WtrStatsBar from "./components/wtr/WtrStatsBar";
import WtrStoriesSection from "./components/wtr/WtrStoriesSection";
import IfuntologyPageLayout from "./IfuntologyPageLayout";

export default function IfuntologyWriteToReadPage() {
  return (
    <IfuntologyPageLayout title="Write to Read">
      <div className="flex flex-col gap-5 sm:gap-6">
        <WtrHero />
        <WtrFeatureBar />
        <WtrAudienceCards />
        <WtrStoriesSection />
        <WtrStatsBar />
        <WtrCta />
      </div>
    </IfuntologyPageLayout>
  );
}
