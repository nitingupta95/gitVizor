"use client"

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useProject from '@/hooks/use-project';
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Ask them to copy and paste this link
          </p>

          <Input
            className="mt-4 cursor-pointer select-all"
            readOnly
            onClick={() => {
              if (inviteUrl) {
                navigator.clipboard.writeText(inviteUrl);
                toast.success("Copied to clipboard");
              }
            }}
            value={inviteUrl}
          />
        </DialogContent>
      </Dialog>

      <Button size="sm" onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </div>
  );
}

export default InviteButton;
