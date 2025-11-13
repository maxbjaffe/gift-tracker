'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageCircle } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

interface ChatDialogProps {
  recipientId: string;
  recipientName: string;
}

export default function ChatDialog({ recipientId, recipientName }: ChatDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat for Gift Ideas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Gift Finder Chat for {recipientName}
          </DialogTitle>
          <DialogDescription>
            Chat with our AI assistant to find the perfect gift for {recipientName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <ChatInterface recipientId={recipientId} recipientName={recipientName} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
