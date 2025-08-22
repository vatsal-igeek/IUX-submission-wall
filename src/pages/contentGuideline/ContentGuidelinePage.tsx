import { useNavigate } from "react-router-dom";
import { routesObject } from "../../routes/routesConfig";
import BackgroundWithSvg from "../../components/Background/BackgroundWithSvg";
import Footer from "../../components/Footer";
import {
  GuidelineSection,
  GuidelineList,
} from "../../components/contentGuideline/GuidelineSection";
import {
  encouragedContent,
  languageRequirement,
  moderationEnforcement,
  prohibitedContent,
  reportingContent,
} from "../../constant/guideline";

const ContentGuidelinePage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative min-h-screen p-8">
        <BackgroundWithSvg />

        {/* Logo */}
        <div
          className="absolute top-[3.125rem] left-1/2 -translate-x-1/2 z-50 cursor-pointer"
          onClick={() => navigate(routesObject.home.path)}
        >
          <img src="/IUX-logo-Primary.svg" alt="logo" />
        </div>

        {/* Main Content */}
        <div className="max-w-[75rem] mx-auto pt-[200px] relative z-10">
          {/* Main Heading */}
          <h1 className="font-size-4rem font-extrabold text-white ">
            Wishing Wall Content Guidelines:
          </h1>

          {/* Subtitle */}
          <h2 className="font-size-4rem font-extrabold text-white mb-4">
            Share Your Wisdom Responsibly
          </h2>

          {/* Last Modified Date */}
          <p className="font-size-1_5rem text-primary-main font-medium mb-8">
            Last modified: June 30, 2025
          </p>

          {/* Introduction */}
          <div className="mb-8">
            <p className="text-subTitle font-size-1_5rem mb-4 font-medium">
              Welcome to The Network of Wisdom. This is a space for collective
              learning and shared financial insights. To maintain a positive and
              constructive environment, please adhere to the following
              guidelines.
            </p>
          </div>

          {/* What to Share Section */}
          <GuidelineSection title="What to Share (Encouraged Content):">
            <GuidelineList type="bullet" items={encouragedContent} />
          </GuidelineSection>

          {/* What NOT to Share Section */}
          <GuidelineSection title="What NOT to Share (Prohibited Content):">
            <GuidelineList type="numbered" items={prohibitedContent} />
          </GuidelineSection>

          {/* Language Requirement Section */}
          <GuidelineSection title="Language Requirement:">
            <GuidelineList type="bullet" items={languageRequirement} />
          </GuidelineSection>

          {/* Moderation & Enforcement Section */}
          <GuidelineSection title="Moderation & Enforcement:">
            <GuidelineList type="bullet" items={moderationEnforcement} />
          </GuidelineSection>

          {/* Reporting Content Section */}
          <GuidelineSection title="Reporting Content:">
            <GuidelineList type="bullet" items={reportingContent} />
          </GuidelineSection>
        </div>
      </div>

      {/* Footer */}
      <Footer isTransParent={false} />
    </>
  );
};

export default ContentGuidelinePage;
