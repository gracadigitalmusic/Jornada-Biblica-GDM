import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CoopSession, CoopPlayer } from '@/hooks/useCoopMode';

interface ChatMessage {
  id: number;
  sender: string;
  avatar: string;
  content: string;
  timestamp: string;
}

interface CoopChatProps {
  session: CoopSession;
  currentPlayer: CoopPlayer;
}

export function CoopChat({ session, currentPlayer }: CoopChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Configuração do Canal Supabase para Broadcast
  useEffect(() => {
    const channel = supabase.channel(`coop-chat-${session.id}`);

    channel
      .on(
        'broadcast',
        { event: 'chat-message' },
        ({ payload }) => {
          setMessages(prev => [...prev, payload as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session.id]);

  // 2. Rolagem automática para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      // Acessa o viewport interno do ScrollArea (Radix UI)
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  // 3. Envio de Mensagem
  const handleSend = async () => {
    if (!input.trim()) return;

    const message: ChatMessage = {
      id: Date.now(),
      sender: currentPlayer.name,
      avatar: currentPlayer.avatar,
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const channel = supabase.channel(`coop-chat-${session.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'chat-message',
      payload: message,
    });

    setInput('');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Chat do Time
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 mb-4 pr-2" ref={scrollRef}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === currentPlayer.name ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-xl ${
                  msg.sender === currentPlayer.name 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{msg.avatar}</span>
                    <span className="font-semibold text-sm">{msg.sender}</span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enviar mensagem..."
          />
          <Button onClick={handleSend} disabled={!input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}