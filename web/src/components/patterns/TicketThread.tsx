import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { VirtualList } from './VirtualList'
import { formatDate } from '@/lib/utils'
import type { TicketMessage } from '@/types'

interface TicketThreadProps {
  messages: TicketMessage[]
  onSend: (body: string) => Promise<void>
  readOnly?: boolean
  authorLabels?: Record<string, string>
}

export function TicketThread({ messages, onSend, readOnly, authorLabels }: TicketThreadProps) {
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  const getAuthor = (msg: TicketMessage) => {
    const key = msg.authorAdminId ?? msg.authorSellerId ?? msg.authorBuyerId ?? 'system'
    return authorLabels?.[key] ?? msg.authorType
  }

  const handleSend = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      await onSend(reply)
      setReply('')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <VirtualList
        items={messages}
        estimateSize={80}
        height={360}
        renderItem={(msg) => (
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium capitalize text-foreground">{getAuthor(msg)}</span>
              <span>{formatDate(msg.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm">{msg.body}</p>
          </div>
        )}
      />
      {!readOnly && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a reply…"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="min-h-[60px]"
          />
          <Button onClick={() => void handleSend()} disabled={sending || !reply.trim()}>
            Send
          </Button>
        </div>
      )}
    </div>
  )
}
