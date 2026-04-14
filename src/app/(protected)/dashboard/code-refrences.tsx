"use client"
import { Tabs, TabsContent } from '@/components/ui/tabs'
import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism"
import { cn } from "@/lib/utils"   // make sure this exists in your project

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[]
}

export const CodeReferences = ({ filesReferences }: Props) => {
  
  if (!filesReferences || filesReferences.length === 0) return null;
  const [tab, setTab] = React.useState(filesReferences[0].fileName)
  return (
    <div className="max-w-[70vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-scroll flex gap-2 bg-muted p-1 rounded-md">
          {filesReferences.map((file) => (
            <button
              onClick={() => setTab(file.fileName)}
              key={file.fileName}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap text-muted-foreground hover:bg-muted",
                tab === file.fileName && "bg-primary text-primary-foreground"
              )}
            >
              {file.fileName}
            </button>
          ))}
        </div>
        {filesReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="max-h-[40vh] overflow-scroll max-w-7xl rounded-md"
          >
            <SyntaxHighlighter language="typescript" style={lucario}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
