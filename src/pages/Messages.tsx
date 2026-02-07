import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getUserChats, getChatMessages, sendMessage, getUserById } from '@/lib/firebase';
import { Loader2, Send, MessageSquare, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import Header from '@/components/layout/Header';

interface Chat {
  id: string;
  participants: string[];
  applicationId: string;
  createdAt: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedChatId = searchParams.get('chat');

  const [chats, setChats] = useState<Chat[]>([]);
  const [chatPartners, setChatPartners] = useState<Record<string, any>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchChats();
  }, [user]);

  useEffect(() => {
    if (selectedChatId && chats.length > 0) {
      const chat = chats.find(c => c.id === selectedChatId);
      if (chat) {
        selectChat(chat);
      }
    }
  }, [selectedChatId, chats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const fetchChats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userChats = await getUserChats(user.id);
      setChats(userChats);

      const partners: Record<string, any> = {};
      for (const chat of userChats) {
        const partnerId = chat.participants.find((p: string) => p !== user.id);
        if (partnerId && !partners[partnerId]) {
          const partnerInfo = await getUserById(partnerId);
          if (partnerInfo) {
            partners[partnerId] = partnerInfo;
          }
        }
      }
      setChatPartners(partners);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectChat = (chat: Chat) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    setSelectedChat(chat);
    setMessages([]);

    const unsubscribe = getChatMessages(chat.id, (msgs) => {
      setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
    });

    unsubscribeRef.current = unsubscribe;
  };

  const handleSend = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;

    setSending(true);
    try {
      await sendMessage(selectedChat.id, user.id, user.name, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPartnerName = (chat: Chat) => {
    const partnerId = chat.participants.find(p => p !== user?.id);
    return partnerId ? chatPartners[partnerId]?.name || 'Unknown' : 'Unknown';
  };

  const getPartnerInitial = (chat: Chat) => {
    const name = getPartnerName(chat);
    return name.charAt(0).toUpperCase();
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    msgs.forEach((msg) => {
      const msgDate = formatDate(msg.timestamp);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List - WhatsApp style sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold">Chats</h2>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No conversations yet</p>
              <p className="text-muted-foreground text-xs mt-1">Start chatting after applications are accepted</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => {
                const lastMessage = messages.find(m => 
                  chat.participants.includes(m.senderId)
                );
                
                return (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${
                      selectedChat?.id === chat.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-lg flex-shrink-0">
                      {getPartnerInitial(chat)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{getPartnerName(chat)}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(chat.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        Tap to view messages
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Window - WhatsApp style */}
        <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-4 flex items-center gap-3 border-b border-border bg-card">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedChat(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold">
                  {getPartnerInitial(selectedChat)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{getPartnerName(selectedChat)}</h3>
                  <p className="text-xs text-muted-foreground">Tap for info</p>
                </div>
              </div>
              
              {/* Messages Area - WhatsApp style background */}
              <div 
                className="flex-1 overflow-y-auto p-4"
                style={{
                  backgroundColor: 'hsl(var(--muted))',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              >
                <div className="max-w-3xl mx-auto space-y-1">
                  {groupMessagesByDate(messages).map((group, groupIndex) => (
                    <div key={groupIndex}>
                      {/* Date Separator */}
                      <div className="flex justify-center my-4">
                        <span className="bg-card px-3 py-1 rounded-lg text-xs text-muted-foreground shadow-sm">
                          {group.date}
                        </span>
                      </div>
                      
                      {/* Messages */}
                      {group.messages.map((msg, msgIndex) => {
                        const isOwn = msg.senderId === user.id;
                        const showTail = msgIndex === 0 || 
                          group.messages[msgIndex - 1]?.senderId !== msg.senderId;
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}
                          >
                            <div
                              className={`relative max-w-[75%] sm:max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                                  : 'bg-card text-foreground rounded-tl-none'
                              } ${showTail ? '' : isOwn ? 'rounded-tr-lg' : 'rounded-tl-lg'}`}
                            >
                              <p className="text-sm break-words">{msg.message}</p>
                              <div className={`flex items-center justify-end gap-1 mt-1 ${
                                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                <span className="text-[10px]">{formatTime(msg.timestamp)}</span>
                                {isOwn && (
                                  <CheckCheck className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input - WhatsApp style */}
              <div className="p-3 bg-muted/50 border-t border-border">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2 max-w-3xl mx-auto"
                >
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                      className="pr-12 rounded-full bg-card border-0 shadow-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={sending || !newMessage.trim()} 
                    size="icon"
                    className="rounded-full h-10 w-10 gradient-primary shadow-sm"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 p-6">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">KaamNearby Chat</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Select a conversation from the list to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
