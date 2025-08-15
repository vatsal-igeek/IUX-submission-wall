import React from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";

interface GuidelineSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const GuidelineSection = ({
  title,
  children,
  className = "",
}: GuidelineSectionProps) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="font-size-2rem font-bold text-subTitle mb-4">{title}</h2>
      {children}
    </div>
  );
};

interface GuidelineItemProps {
  type: "bullet" | "numbered";
  index?: number;
  title?: string;
  description: string;
  highlightedText?: string;
  linkText?: string;
  linkHref?: string;
}

const GuidelineItem = ({
  type,
  index,
  title,
  description,
  highlightedText,
  linkText,
  linkHref,
}: GuidelineItemProps) => {
  const bulletIcon = "•";
  const number = index ? `${index}.` : "";

  // Handles highlighting words in description
  const renderDescription = () => {
    let textParts: (string | JSX.Element)[] = [description];

    if (highlightedText) {
      textParts = textParts.flatMap((part) =>
        typeof part === "string"
          ? part
              .split(highlightedText)
              .flatMap((subPart, i, arr) => [
                subPart,
                i < arr.length - 1 ? (
                  <span className="text-primary-main" key={`highlight-${i}`}>
                    {highlightedText}
                  </span>
                ) : null,
              ])
              .filter((el) => el !== null)
          : [part]
      );
    }

    if (linkText && linkHref) {
      textParts = textParts.flatMap((part) =>
        typeof part === "string"
          ? part
              .split(linkText)
              .flatMap((subPart, i, arr) => [
                subPart,
                i < arr.length - 1 ? (
                  <Link
                    to={linkHref}
                    target="_blank"
                    className="text-primary-main underline"
                    key={`link-${i}`}
                  >
                    {linkText}
                  </Link>
                ) : null,
              ])
              .filter((el) => el !== null)
          : [part]
      );
    }

    return textParts;
  };

  return (
    <li
      className={cn("flex", type === "bullet" ? "items-center" : "items-start")}
    >
      <span className="text-primary-main mr-3 mt-1 font-bold font-size-1_5rem">
        {type === "bullet" ? bulletIcon : number}
      </span>
      <p className="text-subTitle font-size-1_5rem">
        {title && (
          <span className="text-primary-main font-bold font-size-1_5rem">
            {title}:
          </span>
        )}{" "}
        <span className="font-medium">{renderDescription()}</span>
      </p>
    </li>
  );
};

interface GuidelineListProps {
  type: "bullet" | "numbered";
  items: Omit<GuidelineItemProps, "type">[];
}

const GuidelineList = ({ type, items }: GuidelineListProps) => {
  const ListComponent = type === "bullet" ? "ul" : "ol";

  return (
    <ListComponent className="space-y-3">
      {items.map((item, index) => (
        <GuidelineItem
          key={index}
          type={type}
          index={type === "numbered" ? index + 1 : undefined}
          title={item.title}
          description={item.description}
          highlightedText={item.highlightedText}
          linkText={item.linkText}
          linkHref={item.linkHref}
        />
      ))}
    </ListComponent>
  );
};

export { GuidelineSection, GuidelineItem, GuidelineList };
