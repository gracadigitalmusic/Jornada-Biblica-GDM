import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAINarrator } from '@/hooks/useAINarrator';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function AICompanion() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Olá, peregrino! Sou seu narrador nesta jornada bíblica. Como posso ajudá-lo a entender melhor as Escrituras?' }
  ]);
  const [input, setInput] = useState('');
  const { getNarration, isLoading } = useAINarrator();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const context = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const narrative = await getNarration(context, input);

    if (narrative) {
      setMessages(prev => [...prev, { role: 'ai', content: narrative }]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl border-2 border-purple-500/20">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-lg">
                <div className="flex items-center gap-2 text-white">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-bold">Narrador IA</h3>
                  <Sparkles className="w-4 h-4 ml-auto" />
                </div>
              </div>

              <CardContent className="p-0">
                <ScrollArea className="h-96 p-4">
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Pergunte sobre a Bíblia..."
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={isLoading || !input.trim()}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    💡 Pergunte sobre histórias, personagens ou ensinamentos
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
