const fs = require('fs');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filePath, content);
}

// Fix app-sidebar.tsx
replaceInFile('src/app/(protected)/app-sidebar.tsx', [
    { search: /const  = use\(\);\n/g, replace: '' },
    { search: /const  = useRefetch\(\);\n/g, replace: '' },
    { search: /import useRefetch from "@\/hooks\/use-";\n/g, replace: '' },
    { search: /import use from "@\/hooks\/use-";\n/g, replace: '' }
]);

const imgFixes = [
    { search: /\{\/\* eslint-disable-next-line @next\/next\/no-img-element \*\/\}\n/g, replace: '' }
];
// Fix commit-log.tsx
replaceInFile('src/app/(protected)/dashboard/commit-log.tsx', imgFixes);
let commitLog = fs.readFileSync('src/app/(protected)/dashboard/commit-log.tsx', 'utf8');
fs.writeFileSync('src/app/(protected)/dashboard/commit-log.tsx', '/* eslint-disable @next/next/no-img-element */\n' + commitLog);

// Fix team-member.tsx
replaceInFile('src/app/(protected)/dashboard/team-member.tsx', imgFixes);
let teamMember = fs.readFileSync('src/app/(protected)/dashboard/team-member.tsx', 'utf8');
fs.writeFileSync('src/app/(protected)/dashboard/team-member.tsx', '/* eslint-disable @next/next/no-img-element */\n' + teamMember);

// Fix qa/page.tsx
replaceInFile('src/app/(protected)/qa/page.tsx', imgFixes);
let qaPage = fs.readFileSync('src/app/(protected)/qa/page.tsx', 'utf8');
fs.writeFileSync('src/app/(protected)/qa/page.tsx', '/* eslint-disable @next/next/no-img-element */\n' + qaPage);

// Add fixes for run-middleware.ts consistent-type-imports
replaceInFile('src/lib/run-middleware.ts', [
    { search: /import \{ NextApiRequest, NextApiResponse \} from "next\/server";/g, replace: 'import type { NextApiRequest, NextApiResponse } from "next/server";' }
]);
