import HeroSection from "@/components/home/HeroSection";
import GameCategories from "@/components/home/GameCategories";
import UpcomingSessions from "@/components/home/UpcomingSessions";
import SessionWizard from "@/components/home/SessionWizard";
import CommunityFeatures from "@/components/home/CommunityFeatures";
// import DownloadApp from "@/components/home/DownloadApp";
import { useEffect } from "react";

const HomePage = () => {
  // SEO - Set document title
  useEffect(() => {
    document.title = "GameHub - Find Your Next Gaming Group";
  }, []);

  return (
    <>
      <HeroSection />
      <GameCategories />
      <UpcomingSessions />
      <SessionWizard />
      <CommunityFeatures />
      {/* <DownloadApp /> */}
    </>
  );
};

export default HomePage;
