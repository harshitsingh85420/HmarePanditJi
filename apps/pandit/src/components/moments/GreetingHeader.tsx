"use client";

import React, { useEffect, useState } from "react";
import { hi } from "../../lib/strings";

export interface GreetingHeaderProps {
  firstName: string;
}

export function GreetingHeader({ firstName }: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState<string>("Namaste");
  const [shloka, setShloka] = useState<string>("Om Namah Shivaya");

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const date = now.getDate();

    let greet = "Namaste";
    if (hours >= 4 && hours < 11) {
      greet = "Shubh Prabhat";
    } else if (hours >= 11 && hours < 17) {
      greet = "Namaste";
    } else if (hours >= 17 && hours < 21) {
      greet = "Shubh Sandhya";
    } else {
      greet = "Shubh Ratri";
    }
    setGreeting(greet);

    const shlokas = [
      "Om Namah Shivaya",
      "Om Ganesha Namaha",
      "Om Namo Narayanaya",
    ];
    setShloka(shlokas[date % 3]);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <h2 className="t-title font-bold text-ink">
        {greeting}, {firstName} जी
      </h2>
      <p className="t-hint italic font-medium text-softgrey">
        {shloka}
      </p>
    </div>
  );
}

export default GreetingHeader;
