"use client";

type Props = {
  primary: string;
  secondary?: string;
  className?: string;
  secondaryClassName?: string;
};

export function DualLanguageLabel({
  primary,
  secondary,
  className = "",
  secondaryClassName = "text-gray-400 text-xs mt-0.5",
}: Props) {
  return (
    <span className={className}>
      <span>{primary}</span>
      {secondary && <span className={`block ${secondaryClassName}`}>{secondary}</span>}
    </span>
  );
}
