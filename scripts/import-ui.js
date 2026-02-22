const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, '../ui/stitch_hmarepanditji_landing_page');
const outDir = path.join(__dirname, '../apps/web/src/app');

const filesToProcess = [
    { folder: 'hmarepanditji_landing_page', outPath: 'page.tsx', isClient: false },
    { folder: 'muhurat_explorer_calendar', outPath: 'muhurat/page.tsx', isClient: false },
    { folder: 'pandit_search_results_&_filters', outPath: 'search/page.tsx', isClient: true },
    { folder: 'pandit_profile_&_samagri_selection', outPath: 'pandit/[id]/page.tsx', isClient: false },
    { folder: 'user_registration_&_setup', outPath: 'login/page.tsx', isClient: true },
    { folder: 'booking_summary_&_add-ons', outPath: 'booking/new/page.tsx', isClient: true }
];

function toPascalCase(str) {
    return str
        .split(/[-_&]/)
        .filter(w => w.length > 0)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
}

function convertHtmlToJsx(html) {
    return html
        // Attributes
        .replace(/class=/g, 'className=')
        .replace(/for=/g, 'htmlFor=')
        .replace(/tabindex=/g, 'tabIndex=')
        .replace(/readonly=/g, 'readOnly')
        .replace(/autocomplete=/g, 'autoComplete=')
        .replace(/maxlength=/g, 'maxLength=')
        // SVG attributes
        .replace(/clip-rule=/g, 'clipRule=')
        .replace(/fill-rule=/g, 'fillRule=')
        .replace(/stroke-width=/g, 'strokeWidth=')
        .replace(/stroke-linecap=/g, 'strokeLinecap=')
        .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
        .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
        .replace(/stroke-dasharray=/g, 'strokeDasharray=')
        .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
        .replace(/fill-opacity=/g, 'fillOpacity=')
        .replace(/viewbox=/gi, 'viewBox=')
        // HTML-JSX specific value mapping
        .replace(/checked="checked"/g, 'defaultChecked')
        .replace(/style="([^"]+)"/g, (match, p1) => {
            if (p1.includes('width:')) {
                let width = p1.match(/width:\s*([^;]+)/)[1].trim();
                return `style={{ width: "${width}" }}`;
            }
            return match;
        })
        .replace(/tabIndex="1"/g, 'tabIndex={1}')
        .replace(/maxLength="1"/g, 'maxLength={1}')
        // Styles
        .replace(/style='([^']+)'/g, (match, p1) => {
            let url = p1.match(/url\([^)]+\)/);
            if (url) {
                return `style={{ backgroundImage: "${url[0].replace(/"/g, "'")}" }}`;
            }
            return match;
        })
        // Remove Comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Self-closing tags (regex is very basic)
        .replace(/<img([^>]*[^/])(?<!\/)>/ig, '<img$1 />')
        .replace(/<input([^>]*[^/])(?<!\/)>/ig, '<input$1 />')
        .replace(/<hr([^>]*[^/])(?<!\/)>/ig, '<hr$1 />')
        .replace(/<br([^>]*[^/])?(?<!\/)>/ig, '<br$1 />')
        // General fix for random links
        .replace(/href="#"/g, 'href="/"');
}

filesToProcess.forEach(item => {
    const codePath = path.join(uiDir, item.folder, 'code.html');
    if (fs.existsSync(codePath)) {
        const htmlObj = fs.readFileSync(codePath, 'utf-8');

        // Extract main or body
        let bodyMatch = htmlObj.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
        let contentHtml = '';
        if (bodyMatch) {
            contentHtml = bodyMatch[0]; // Includes <main>
        } else {
            let bodyInsideMatch = htmlObj.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            contentHtml = bodyInsideMatch ? bodyInsideMatch[1] : '';
        }

        const jsx = convertHtmlToJsx(contentHtml);

        const targetPath = path.join(outDir, item.outPath);
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        let finalCode = '';
        if (item.isClient) {
            finalCode += '"use client";\n\n';
        }
        const componentName = toPascalCase(item.folder);
        finalCode += `import React from 'react';\nimport Link from 'next/link';\n\n`;
        finalCode += `export default function ${componentName}() {\n`;
        finalCode += `  return (\n    <>\n      {/* Generated from UI ${item.folder} */}\n      ${jsx}\n    </>\n  );\n}\n`;

        fs.writeFileSync(targetPath, finalCode);
        console.log(`Processed ${item.folder} -> ${item.outPath}`);
    } else {
        console.log(`Missing ${codePath}`);
    }
});
