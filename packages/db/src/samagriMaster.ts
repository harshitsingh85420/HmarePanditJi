export const SATYANARAYAN_ITEMS = [
  { name: "रोली", qty: "1 पैकेट" },
  { name: "मौली", qty: "1 गोला" },
  { name: "सिंदूर", qty: "1 डिब्बी" },
  { name: "चावल (अक्षत)", qty: "1 किलो" },
  { name: "देसी घी", qty: "500 ग्राम" },
  { name: "हवन सामग्री", qty: "1 पैकेट" },
  { name: "कलश", qty: "1" },
  { name: "नारियल", qty: "2" },
  { name: "पान के पत्ते", qty: "11" },
  { name: "सुपारी", qty: "11" },
  { name: "केले", qty: "1 दर्जन" },
  { name: "फूल-माला", qty: "2" },
  { name: "धूप-अगरबत्ती", qty: "1 पैकेट" },
  { name: "कपूर", qty: "1 डिब्बी" },
  { name: "गंगाजल", qty: "1 बोतल" }
];

export const DEFAULT_SAMAGRI: Record<string, Array<{ name: string; qty: string }>> = new Proxy(
  {
    SATYANARAYAN: SATYANARAYAN_ITEMS
  },
  {
    get: (target: any, prop: string) => {
      return target[prop] || SATYANARAYAN_ITEMS;
    }
  }
);
