"use client";

import React, { useEffect, useState } from "react";
import { t } from "../../lib/i18n";

export interface GreetingHeaderProps {
  firstName: string;
}

export function GreetingHeader({ firstName }: GreetingHeaderProps) {
  const [greeting, setGreeting] = useState<string>(t("greetings.afternoon"));
  const [shloka, setShloka] = useState<string>(t("greetings.shloka1"));

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    const date = now.getDate();

    let greet: string = t("greetings.afternoon");
    if (hours >= 4 && hours < 11) {
      greet = t("greetings.morning");
    } else if (hours >= 11 && hours < 17) {
      greet = t("greetings.afternoon");
    } else if (hours >= 17 && hours < 21) {
      greet = t("greetings.evening");
    } else {
      greet = t("greetings.night");
    }
    setGreeting(greet);

    const shlokas = [
      t("greetings.shloka1"),
      t("greetings.shloka2"),
      t("greetings.shloka3"),
    ];
    // Pick shloka by day-of-month % 3
    setShloka(shlokas[date % 3]);
  }, []);

  return (
    <div className="flex flex-col gap-1 w-full text-left">
      <h2 className="t-title font-bold text-ink">
        {greeting}, {firstName} {t("greetings.suffix")}
      </h2>
      <p className="t-hint font-medium text-softgrey">
        {shloka}
      </p>
    </div>
  );
}

export default GreetingHeader;
