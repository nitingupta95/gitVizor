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
import { Sparkles } from 'lucide-react'

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
  <DialogContent className='sm:max-w-[80vw] max-h-[80vh] overflow-auto border border-border/40 bg-background/95 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.4)]'>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        AI Answer
      </DialogTitle>
    </DialogHeader>

    <div className="mt-4">
      <MDEditor.Markdown 
        source={answer} 
        className='max-w-full !h-64 overflow-auto border border-border/40 rounded-xl p-4 bg-muted/30'
      />

      <div className="mt-4">
        <CodeReferences filesReferences={fileReferences} />
      </div>

      {/* Buttons at the bottom */}
      <div className="mt-6 flex justify-end gap-2">
        <Button type='button' variant='outline' onClick={()=>setOpen(false)} className="border-border/40">
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
          className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
        >
          Save Answer
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>


      <Card className="relative col-span-3 border border-border/40 bg-card/60 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            Ask a question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="border-border/40 bg-background/50 focus:border-primary/30 transition-colors"
            />
            <div className="h-4" />
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all">
              {loading ? 'Asking...' : 'Ask GitVizor!'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  )
}

export default AskQuestionCard