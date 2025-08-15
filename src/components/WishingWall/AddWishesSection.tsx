import React, { useState } from "react";

import { Link } from "react-router-dom";

import { routesObject } from "../../routes/routesConfig";
import MagicBento from "../animations/MagicBento/MagicBento";
import { wishService } from "../../api/wish/endPoints";
import { getCookie } from "../../utils";
import toast from "react-hot-toast";

const AddWishesSection = () => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxCharacters = 300;
  const characterCount = message.length;
  const userId = getCookie("iux-token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!userId || !message) return;

      setIsSubmitting(true);
      await wishService.addWish({
        text: message,
        userId: userId,
      });
      setMessage("");
      setIsSubmitting(false);
      toast.success("Wish added successfully.");
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Failed to add wish.");
      console.error("Error submitting wish:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxCharacters) {
      setMessage(value);
    }
  };

  return (
    <div className="flex items-center justify-center pt-[3.125rem] md:pt-[5rem] lg:pt-[9.375rem]">
      <div className="w-full max-w-5xl p-5 md:p-[1.875rem]">
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <p className="mb-10 text-[1.875rem] md:text-[2.5rem] lg:text-[3rem] font-extrabold text-center">
            What financial aspect/knowledge do you wish you would have known
            earlier?
          </p>

          <div className="relative">
            <textarea
              value={message}
              onChange={handleInputChange}
              placeholder=""
              className="w-full h-52 p-4 bg-inputBg border-none rounded-2xl resize-none focus:outline-none focus:border focus:border-primary-main"
            />

            {message.length < 1 && (
              <div className="absolute inset-0 p-4 pointer-events-none">
                <div className="text-sm md:text-base text-subTitle">
                  <p>
                    Be Respectful & Safe: Avoid profanity, hate speech, and
                    personal attacks.
                  </p>
                  <p>
                    Protect Privacy: Do not share sensitive personal
                    information.
                  </p>
                  <p>
                    Stay on Topic: Messages must be financial lessons. No spam
                    or ads.
                  </p>
                  <p>English Only: All submissions must be in English</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-base font-medium">
            <Link
              to={routesObject.contentGuideline.path}
              className="text-primary-main underline transition-colors"
            >
              Content Guideline
            </Link>

            <span>
              {characterCount}/{maxCharacters}
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-[1.875rem]">
            <MagicBento
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="15, 239, 158"
              buttonText={isSubmitting ? "Submitting..." : "Submit"}
              width="100%"
              buttonType="submit"
              isDisabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWishesSection;
