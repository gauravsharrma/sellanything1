import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} from '../services/firestore';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

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

  const handleEditSave = async () => {
    if (editingId && editText.trim()) {
      await editMessage(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
      if (user) {
        const msgs = await getMessages(user.id, otherUserId);
        setMessages(msgs);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this message?')) {
      await deleteMessage(id);
      if (user) {
        const msgs = await getMessages(user.id, otherUserId);
        setMessages(msgs);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-2 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`relative p-2 rounded-md ${m.fromId === user?.id ? 'bg-primary-100 text-right' : 'bg-gray-100'}`}
          >
            {editingId === m.id ? (
              <div className="flex gap-2">
                <input
                  className="flex-grow border border-gray-300 rounded-md px-2"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <Button size="sm" onClick={handleEditSave}>Save</Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setEditText('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span className={m.deleted ? 'line-through text-gray-400' : ''}>{m.text}</span>
                {m.editedAt && !m.deleted && (
                  <span className="ml-1 text-xs text-gray-500">(edited)</span>
                )}
                {m.deleted && <span className="ml-1 text-xs text-gray-500">(deleted)</span>}
                {m.fromId === user?.id && !m.deleted && (
                  <span className="ml-2 text-xs text-gray-500">
                    <button
                      className="underline mr-1"
                      onClick={() => {
                        setEditingId(m.id);
                        setEditText(m.text);
                      }}
                    >
                      Edit
                    </button>
                    <button className="underline text-red-600" onClick={() => handleDelete(m.id)}>
                      Delete
                    </button>
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
};

export default MessagingPage;
