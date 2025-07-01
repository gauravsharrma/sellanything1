import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMessagesByUser, getUserById } from '../services/firestore';
import { Message, User } from '../types';
import Button from '../components/Button';
import Modal from '../components/Modal';
import MessagingPage from './MessagingPage';

const MessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [openChat, setOpenChat] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);

  useEffect(() => {
    const load = async () => {
      if (user) {
        const msgs = await getMessagesByUser(user.id);
        setMessages(msgs);
      }
    };
    load();
  }, [user]);

  const threads = useMemo(() => {
    const map = new Map<string, Message>();
    messages.forEach((m) => {
      const other = m.fromId === user?.id ? m.toId : m.fromId;
      const existing = map.get(other);
      if (!existing || new Date(existing.createdAt) < new Date(m.createdAt)) {
        map.set(other, m);
      }
    });
    return Array.from(map.entries());
  }, [messages, user]);

  const openThread = async (otherId: string) => {
    setOpenChat(otherId);
    const usr = await getUserById(otherId);
    setOtherUser(usr);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Messages</h2>
      <div className="space-y-2">
        {threads.map(([otherId, msg]) => (
          <div key={otherId} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
            <span>{otherId}</span>
            <Button size="sm" onClick={() => openThread(otherId)}>Open</Button>
          </div>
        ))}
        {threads.length === 0 && <p>No messages yet.</p>}
      </div>

      {openChat && (
        <Modal isOpen={true} onClose={() => setOpenChat(null)} title={otherUser ? `Chat with ${otherUser.name}` : 'Conversation'}>
          <MessagingPage otherUserId={openChat} />
        </Modal>
      )}
    </div>
  );
};

export default MessagesScreen;
