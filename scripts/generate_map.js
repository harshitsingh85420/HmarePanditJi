const ob = require('./india_map_obj.json');
const fs = require('fs');

const paths = ob.locations.map(l => 
  `      <path d="${l.path}" id="${l.id}" title="${l.name}" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />`
).join('\n');

const content = `import React from "react";

export function IndiaMapSVG(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="${ob.viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g>
${paths}
      </g>
    </svg>
  );
}
`;

fs.writeFileSync('e:/HmarePanditJi/hmarepanditji/apps/pandit/src/components/IndiaMapSVG.tsx', content);
console.log('Saved IndiaMapSVG.tsx');
