"use client"

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useProject from '@/hooks/use-project';
import { Users, Copy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  // ✅ Runs only on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteUrl(`${window.location.origin}/join/${projectId}`);
    }
  }, [projectId]);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border/40 bg-background/95 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.4)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              Invite Team Members
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Share this link with your teammates to give them access
          </p>

          <div className="relative mt-2">
            <Input
              className="cursor-pointer select-all border-border/40 bg-background/50 pr-10"
              readOnly
              onClick={() => {
                if (inviteUrl) {
                  navigator.clipboard.writeText(inviteUrl);
                  toast.success("Copied to clipboard");
                }
              }}
              value={inviteUrl}
            />
            <Copy className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>

      <Button size="sm" onClick={() => setOpen(true)} className="bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all">
        <Users className="mr-1.5 h-3.5 w-3.5" />
        Invite Members
      </Button>
    </div>
  );
}

export default InviteButton;
