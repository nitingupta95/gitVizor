"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react' 
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card'
import MDEditor from '@uiw/react-md-editor'
import { CodeReferences } from '../dashboard/code-refrences'
import { Bot, MessageSquare } from 'lucide-react'

const QApage = () => {
  const {projectId} =  useProject()
  const {data:questions} = api.project.getQuestions.useQuery({projectId: projectId!})
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const question = questions?.[questionIndex];
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-6"></div>
      <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
        </div>
        Saved Questions
      </h1>
      <div className="h-3"></div>
      <div className="flex flex-col gap-3">
        {questions?.map((question, index) => {
          return <React.Fragment key={question.id}>
            <SheetTrigger onClick={() => setQuestionIndex(index)} >
              <div className="flex items-center gap-4 bg-card/60 border border-border/40 rounded-xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-sm hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] hover:border-border/60 hover:bg-card/80 transition-all duration-300">
                {question.User?.imageUrl && (
                  <img
                    src={question.User.imageUrl}
                    alt="User"
                    className="rounded-full ring-2 ring-border/30 ring-offset-1 ring-offset-background"
                    height={30}
                    width={30}
                  />
                )}
                <div className='text-left flex flex-col'>
                  <div className='flex items-center gap-2'>
                    <p className='text-foreground line-clamp-1 text-lg font-medium'>
                      {question.question}
                    </p>
                    <span className='text-xs text-muted-foreground whitespace-nowrap'>
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className='text-muted-foreground line-clamp-1 text-sm'>
                    {question.answer}
                  </p>
                </div>

              </div> 
            </SheetTrigger>
          </React.Fragment>
        })}
      </div>
        {question && (
          <SheetContent className='sm:max-w-[80w] border-border/40 bg-background/95 backdrop-blur-xl'>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                {question.question}
              </SheetTitle>

              {/* Display the answer properly */}
              <MDEditor.Markdown 
                source={question.answer ?? "No answer yet"} 
                className='max-w-full !h-64 overflow-auto border border-border/40 rounded-xl p-4 bg-muted/20'
              />

              {/* Display code references if any */}
              {question.fileReferences && (question.fileReferences as any[]).length > 0 && (
                <div className="mt-4">
                  <CodeReferences filesReferences={question.fileReferences as any} />
                </div>
              )}
            </SheetHeader>
          </SheetContent>
        )}


    </Sheet>
  )
}

export default QApage