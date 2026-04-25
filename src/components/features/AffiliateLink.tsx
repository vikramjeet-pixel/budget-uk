"use client";

import React from "react";
import { trackAffiliateClick } from "@/lib/analytics";

interface AffiliateLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  destination: string;
  children: React.ReactNode;
}

export function AffiliateLink({
  destination,
  children,
  onClick,
  ...props
}: AffiliateLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackAffiliateClick({ destination });
    onClick?.(e);
  };

  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
