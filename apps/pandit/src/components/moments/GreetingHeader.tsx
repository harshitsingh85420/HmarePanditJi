"use client";

import React, { useEffect, useState } from "react";
import { hi } from "../../lib/strings";

export interface GreetingHeaderProps {
  firstName: string;
}

export function GreetingHeader({ firstName }: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState<string>(hi.greetings.afternoon);
  const [shloka, setShloka] = useState<string>(hi.greetings.shloka1);

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const date = now.getDate();

    let greet: string = hi.greetings.afternoon;
    if (hours >= 4 && hours < 11) {
      greet = hi.greetings.morning;
    } else if (hours >= 11 && hours < 17) {
      greet = hi.greetings.afternoon;
    } else if (hours >= 17 && hours < 21) {
      greet = hi.greetings.evening;
    } else {
      greet = hi.greetings.night;
    }
    setGreeting(greet);

    const shlokas = [
      hi.greetings.shloka1,
      hi.greetings.shloka2,
      hi.greetings.shloka3,
    ];
    // Pick shloka by day-of-month % 3
    setShloka(shlokas[date % 3]);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <h2 className="t-title font-bold text-ink">
        {greeting}, {firstName} {hi.greetings.suffix}
      </h2>
      <p className="t-hint font-medium text-softgrey">
        {shloka}
      </p>
    </div>
  );
}

export default GreetingHeader;
