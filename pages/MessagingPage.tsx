import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMessages, sendMessage } from '../services/firestore';
import { Message } from '../types';
import Button from '../components/Button';

interface MessagingPageProps {
  otherUserId: string;
  productId?: string;
}

const MessagingPage: React.FC<MessagingPageProps> = ({ otherUserId, productId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const load = async () => {
      if (user) {
        const msgs = await getMessages(user.id, otherUserId);
        setMessages(msgs);
      }
    };
    load();
  }, [user, otherUserId]);

  const handleSend = async () => {
    if (user && text.trim()) {
      await sendMessage({
        fromId: user.id,
        toId: otherUserId,
        text: text.trim(),
        productId,
        createdAt: new Date().toISOString(),
      });
      setText('');
      const msgs = await getMessages(user.id, otherUserId);
      setMessages(msgs);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-2 mb-4">
        {messages.map(m => (
          <div key={m.id} className={`p-2 rounded-md ${m.fromId === user?.id ? 'bg-primary-100 text-right' : 'bg-gray-100'}`}>{m.text}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};

export default MessagingPage;
