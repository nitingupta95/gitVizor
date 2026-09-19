"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { FileCode2 } from "lucide-react";

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
};

export const CodeReferences = ({ filesReferences }: Props) => {
  const [tab, setTab] = React.useState(filesReferences?.[0]?.fileName || "");
  if (!filesReferences || filesReferences.length === 0) return null;

  return (
    <div className="w-full min-w-0 flex flex-col">
      <Tabs value={tab} onValueChange={setTab} className="w-full flex flex-col min-w-0">
        
        {/* Tab List */}
        <div className="flex gap-1.5 bg-muted/40 border border-border/40 p-1.5 rounded-xl overflow-x-auto no-scrollbar flex-shrink-0 w-full">
          {filesReferences.map((file) => {
            const isActive = tab === file.fileName;
            return (
              <button
                onClick={() => setTab(file.fileName)}
                key={file.fileName}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent"
                )}
              >
                <FileCode2 className={cn("w-3.5 h-3.5", isActive ? "text-blue-400" : "opacity-60")} />
                {file.fileName}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {filesReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="mt-3 w-full"
          >
            <div className="rounded-xl border border-border/40 overflow-hidden bg-[#1e1e1e] w-full">
              <div className="bg-muted/30 border-b border-border/20 px-4 py-2 flex justify-between items-center">
                <span className="text-[10px] font-mono text-muted-foreground/60">{file.fileName}</span>
              </div>
              <SyntaxHighlighter 
                language="typescript" 
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  background: "transparent",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
                wrapLines={true}
                showLineNumbers={true}
                lineNumberStyle={{
                  minWidth: "2.5em",
                  paddingRight: "1em",
                  color: "#6e7681",
                  textAlign: "right",
                }}
              >
                {file.sourceCode}
              </SyntaxHighlighter>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
