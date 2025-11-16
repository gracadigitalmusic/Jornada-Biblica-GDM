import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, ArrowLeft, PlusCircle, LogIn } from 'lucide-react';
import { AVATARS_MULTI } from '@/data/questions';
import { Player } from '@/types/quiz';
import { useCoopMode } from '@/hooks/useCoopMode';
import { useToast } from '@/hooks/use-toast';

interface CoopEntryScreenProps {
  onBack: () => void;
  onEnterLobby: () => void;
}

export function CoopEntryScreen({ onBack, onEnterLobby }: CoopEntryScreenProps) {
  const coop = useCoopMode();
  const { toast } = useToast();
  
  const [action, setAction] = useState<'select' | 'create' | 'join'>('select');
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS_MULTI[0]);

  // Carrega o último usuário salvo ou cria um mock
  const defaultPlayer = useMemo(() => {
    const lastUser = localStorage.getItem('jb_last_user');
    if (lastUser) {
      const data = JSON.parse(lastUser);
      setPlayerName(data.name || '');
      setSelectedAvatar(data.avatar || AVATARS_MULTI[0]);
      return data;
    }
    return { name: '', avatar: AVATARS_MULTI[0] };
  }, []);

  const handleCreateSession = async () => {
    if (!playerName.trim()) {
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    
    const player: Player = {
      name: playerName.trim(),
      location: 'Co-op',
      score: 0,
      avatar: selectedAvatar,
    };
    
    // Salva o usuário para a próxima vez
    localStorage.setItem('jb_last_user', JSON.stringify(player));

    await coop.createSession(player, 'Time Bíblico', 4);
    onEnterLobby();
  };

  const handleJoinSession = async () => {
    if (!sessionIdInput.trim()) {
      toast({ title: "Código necessário", description: "Por favor, insira o código da sala.", variant: "destructive" });
      return;
    }
    if (!playerName.trim()) {
      toast({ title: "Nome necessário", description: "Por favor, digite seu nome.", variant: "destructive" });
      return;
    }
    
    const player: Player = {
      name: playerName.trim(),
      location: 'Co-op',
      score: 0,
      avatar: selectedAvatar,
    };
    
    localStorage.setItem('jb_last_user', JSON.stringify(player));
    
    // Tenta entrar na sessão
    await coop.joinSession(sessionIdInput.trim(), player);
    onEnterLobby();
  };

  const renderSelectScreen = () => (
    <div className="space-y-6">
      <Button 
        onClick={() => setAction('create')} 
        className="w-full h-16 text-lg bg-primary hover:bg-primary/90 gap-3"
      >
        <PlusCircle className="w-6 h-6" />
        Criar Nova Sala
      </Button>
      <Button 
        onClick={() => setAction('join')} 
        variant="outline" 
        className="w-full h-16 text-lg gap-3"
      >
        <LogIn className="w-6 h-6" />
        Entrar com Código
      </Button>
      <Button variant="ghost" onClick={onBack} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar ao Menu
      </Button>
    </div>
  );

  const renderPlayerSetup = (onConfirm: () => void, buttonText: string) => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold mb-2">Seu Nome</label>
        <Input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Digite seu nome..."
          maxLength={20}
        />
      </div>
      
      <div>
        <label className="block text-sm font-bold mb-2">Escolha seu Avatar</label>
        <div className="grid grid-cols-7 gap-2">
          {AVATARS_MULTI.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setSelectedAvatar(avatar)}
              className={`text-3xl p-2 rounded-lg transition-all flex items-center justify-center ${
                selectedAvatar === avatar
                  ? 'bg-primary/20 ring-2 ring-primary scale-110'
                  : 'bg-background hover:bg-muted border border-border'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>
      
      {action === 'join' && (
        <div>
          <label className="block text-sm font-bold mb-2">Código da Sala</label>
          <Input
            type="text"
            value={sessionIdInput}
            onChange={(e) => setSessionIdInput(e.target.value.toUpperCase())}
            placeholder="Ex: A1B2C3D4"
            maxLength={8}
          />
        </div>
      )}

      <Button onClick={onConfirm} className="w-full h-12" disabled={!playerName.trim()}>
        {buttonText}
      </Button>
      <Button variant="ghost" onClick={() => setAction('select')} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="p-8 bg-quiz-card border-2 border-primary/30">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Users className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gradient-primary mb-2">
            CO-OP ONLINE
          </h2>
          <p className="text-muted-foreground">
            Jogue em equipe e teste seu conhecimento em tempo real.
          </p>
        </div>

        {action === 'select' && renderSelectScreen()}
        {action === 'create' && renderPlayerSetup(handleCreateSession, 'Criar Sala e Entrar')}
        {action === 'join' && renderPlayerSetup(handleJoinSession, 'Entrar na Sala')}
      </Card>
    </motion.div>
  );
}