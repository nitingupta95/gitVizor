'use client'
import MDEditor from '@uiw/react-md-editor'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import Image from 'next/image'
import { askQuestion } from './action'
import { readStreamableValue } from "@ai-sdk/rsc";
import { CodeReferences } from './code-refrences'
// The import for `file` from zod seems unused, can be removed if not needed elsewhere.
// import { file } from 'zod/v4' 
import { api } from '@/trpc/react'
import { toast } from 'sonner'
import useRefetch from '@/hooks/use-refetch'

const AskQuestionCard = () => {
  const { project } = useProject()
  const [question, setQuestion] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fileReferences, setFileReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([])
  const [answer, setAnswer] = useState('')


  const saveAnswer = api.project.saveAnswer.useMutation()



  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setAnswer('');
    setFileReferences([])
    e.preventDefault()
    if (!project?.id) return


    setLoading(true)
    try {
      const { output, filesReferences } = await askQuestion(question, project.id)
      setOpen(true)
      setFileReferences(filesReferences)

      for await (const delta of readStreamableValue(output)) {
        if (delta) {
          setAnswer(ans => ans + delta)
        }
      }
    } catch (error: any) {
      toast.error('Failed to ask question', { description: error.message || 'The AI service may be down or over quota.' })
    } finally {
      setLoading(false)
    }
  }


  const refetch= useRefetch();

  return (
    <>
     <Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className='sm:max-w-[80vw] max-h-[80vh] overflow-auto border border-border/60 bg-background/80 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.35)]'>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Image src="/log.png" alt="logo" width={40} height={40} />
        Answer
      </DialogTitle>
    </DialogHeader>

    <div className="mt-4">
      <MDEditor.Markdown 
        source={answer} 
        className='max-w-full !h-64 overflow-auto border border-border/60 rounded-lg p-3 bg-muted/30'
      />

      <div className="mt-4">
        <CodeReferences filesReferences={fileReferences} />
      </div>

      {/* Buttons at the bottom */}
      <div className="mt-6 flex justify-end gap-2">
        <Button type='button' variant='outline' onClick={()=>setOpen(false)}>
          Close
        </Button>
        <Button
          disabled={saveAnswer.isPending}
          onClick={() => {
            saveAnswer.mutate(
              { projectId: project!.id, question, answer, fileReferences },
              {
                onSuccess: () => {
                  toast.success('Answer Saved!')
                  refetch();
                },
                onError: () => toast.error('Error Saving Answer'),
              }
            )
          }}
        >
          Save Answer
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>


      <Card className="relative col-span-3 border border-border/60 bg-card/50 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold tracking-tight">Ask a question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="h-4" />
            <Button type="submit" disabled={loading}>
              {loading ? 'Asking...' : 'Ask GitVizor!'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestionCard