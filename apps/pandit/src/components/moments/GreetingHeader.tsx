"use client";

import React, { useEffect, useState } from "react";
import { hi } from "../../lib/strings";

export interface GreetingHeaderProps {
  firstName: string;
}

export function GreetingHeader({ firstName }: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState<string>(hi.design.afternoon);
  const [shloka, setShloka] = useState<string>(hi.design.shloka1);

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const date = now.getDate();

    let greet: string = hi.design.afternoon;
    if (hours >= 4 && hours < 11) {
      greet = hi.design.morning;
    } else if (hours >= 11 && hours < 17) {
      greet = hi.design.afternoon;
    } else if (hours >= 17 && hours < 21) {
      greet = hi.design.evening;
    } else {
      greet = hi.design.night;
    }
    setGreeting(greet);

    const shlokas = [
      hi.design.shloka1,
      hi.design.shloka2,
      hi.design.shloka3,
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
