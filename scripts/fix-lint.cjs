const fs = require('fs');
function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/app/(protected)/dashboard/commit-log.tsx', [
    { search: /<!-- eslint-disable-next-line @next\/next\/no-img-element -->/g, replace: '{/* eslint-disable-next-line @next/next/no-img-element */}' }
]);

replaceInFile('src/app/(protected)/dashboard/team-member.tsx', [
    { search: /<!-- eslint-disable-next-line @next\/next\/no-img-element -->/g, replace: '{/* eslint-disable-next-line @next/next/no-img-element */}' }
]);

replaceInFile('src/app/(protected)/qa/page.tsx', [
    { search: /<!-- eslint-disable-next-line @next\/next\/no-img-element -->/g, replace: '{/* eslint-disable-next-line @next/next/no-img-element */}' }
]);

// app-sidebar.tsx
replaceInFile('src/app/(protected)/app-sidebar.tsx', [
    { search: /refetch/g, replace: '' }
]);

// ask-question-card.tsx
replaceInFile('src/app/(protected)/dashboard/ask-question-card.tsx', [
    { search: /import Image from "next\/image";?/g, replace: '' }
]);

// process-meeting route
replaceInFile('src/app/api/process-meeting/route.ts', [
    { search: /import \{ processMeeting \} from "@\/lib\/process-meeting";?/g, replace: '' },
    { search: /import \{ db \} from "@\/server\/db";?/g, replace: '' }
]);

replaceInFile('src/server/api/process-meeting/route.ts', [
    { search: /import \{ processMeeting \} from "@\/lib\/process-meeting";?/g, replace: '' },
    { search: /import \{ db \} from "@\/server\/db";?/g, replace: '' }
]);

replaceInFile('src/app/api/webhook/stripe/route.ts', [
    { search: /import \{ headers \} from "next\/headers";?/g, replace: '' },
    { search: /NextRequest, /g, replace: '' }
]);

replaceInFile('src/lib/github.ts', [
    { search: /Provider,/g, replace: '' },
    { search: /const project = /g, replace: '' },
    { search: /const commits = /g, replace: '' }
]);

replaceInFile('src/lib/run-middleware.ts', [
    { search: /NextRequest, NextResponse/g, replace: 'NextApiRequest, NextApiResponse' }
]);
