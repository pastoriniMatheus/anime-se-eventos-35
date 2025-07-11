
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import EmojiPicker from '@/components/EmojiPicker';

interface MessageInputProps {
  message: string;
  onChange: (message: string) => void;
}

const MessageInput = ({ message, onChange }: MessageInputProps) => {
  const addEmojiToMessage = (emoji: string) => {
    onChange(message + emoji);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="message">Mensagem</Label>
      <div className="relative">
        <Textarea
          id="message"
          placeholder="Digite sua mensagem aqui..."
          value={message}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="pr-12"
        />
        <div className="absolute bottom-2 right-2">
          <EmojiPicker onEmojiSelect={addEmojiToMessage} />
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
