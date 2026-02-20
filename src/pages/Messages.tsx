import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getUserChats, getChatMessages, sendMessage, getUserById } from '@/lib/firebase';
import { Loader2, Send, MessageSquare, ArrowLeft, CheckCheck, Search } from 'lucide-react';
import Header from '@/components/layout/Header';

interface Chat { id: string; participants: string[]; applicationId: string; createdAt: number; }
interface Message { id: string; senderId: string; senderName: string; message: string; timestamp: number; }

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
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => { if (!user) { navigate('/login'); return; } fetchChats(); }, [user]);
  useEffect(() => { if (selectedChatId && chats.length > 0) { const chat = chats.find(c => c.id === selectedChatId); if (chat) selectChat(chat); } }, [selectedChatId, chats]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { return () => { if (unsubscribeRef.current) unsubscribeRef.current(); }; }, []);

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
          if (partnerInfo) partners[partnerId] = partnerInfo;
        }
      }
      setChatPartners(partners);
    } catch (error) { console.error('Error fetching chats:', error); }
    finally { setLoading(false); }
  };

  const selectChat = (chat: Chat) => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    setSelectedChat(chat);
    setMessages([]);
    const unsub = getChatMessages(chat.id, (msgs) => setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp)));
    unsubscribeRef.current = unsub;
  };

  const handleSend = async () => {
    if (!user || !selectedChat || !newMessage.trim()) return;
    setSending(true);
    try { await sendMessage(selectedChat.id, user.id, user.name, newMessage.trim()); setNewMessage(''); }
    catch (error) { console.error('Error sending message:', error); }
    finally { setSending(false); }
  };

  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts: number) => {
    const d = new Date(ts), today = new Date(), yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const getPartnerName = (chat: Chat) => {
    const pid = chat.participants.find(p => p !== user?.id);
    return pid ? chatPartners[pid]?.name || 'Unknown' : 'Unknown';
  };

  const getPartnerType = (chat: Chat) => {
    const pid = chat.participants.find(p => p !== user?.id);
    return pid ? chatPartners[pid]?.userType || '' : '';
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';
    msgs.forEach(msg => {
      const d = formatDate(msg.timestamp);
      if (d !== currentDate) { currentDate = d; groups.push({ date: d, messages: [msg] }); }
      else groups[groups.length - 1].messages.push(msg);
    });
    return groups;
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    return getPartnerName(chat).toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-lg mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-xl bg-muted/50 border-0 text-sm"
              />
            </div>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-secondary" /></div>
          ) : filteredChats.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold mb-1">No Conversations</h3>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-[200px]">
                {searchQuery ? 'No results found' : 'Conversations appear here when an application is accepted'}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {filteredChats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`w-full px-5 py-4 flex items-center gap-3.5 hover:bg-muted/50 transition-colors border-b border-border/50 ${selectedChat?.id === chat.id ? 'bg-muted' : ''}`}
                >
                  <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                    {getPartnerName(chat).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-sm truncate">{getPartnerName(chat)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{getPartnerType(chat)}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">{formatDate(chat.createdAt)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-16 px-5 flex items-center gap-3.5 border-b border-border bg-card">
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-xl" onClick={() => setSelectedChat(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {getPartnerName(selectedChat).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{getPartnerName(selectedChat)}</h3>
                  <p className="text-[11px] text-muted-foreground capitalize">{getPartnerType(selectedChat)}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5" style={{ background: 'linear-gradient(180deg, hsl(var(--muted) / 0.3) 0%, hsl(var(--background)) 100%)' }}>
                <div className="max-w-2xl mx-auto space-y-1">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-xs">No messages yet. Say hello! 👋</p>
                    </div>
                  )}
                  {groupMessagesByDate(messages).map((group, gi) => (
                    <div key={gi}>
                      <div className="flex justify-center my-4">
                        <span className="bg-card px-3 py-1 rounded-lg text-[10px] text-muted-foreground shadow-soft font-medium">{group.date}</span>
                      </div>
                      {group.messages.map((msg) => {
                        const isOwn = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}>
                            <div className={`max-w-[75%] px-4 py-2.5 shadow-soft ${
                              isOwn 
                                ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md' 
                                : 'bg-card text-foreground rounded-2xl rounded-bl-md border border-border/50'
                            }`}>
                              <p className="text-[13px] break-words leading-relaxed">{msg.message}</p>
                              <div className={`flex items-center justify-end gap-1.5 mt-1 ${isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
                                <span className="text-[9px] font-medium">{formatTime(msg.timestamp)}</span>
                                {isOwn && <CheckCheck className="h-3 w-3" />}
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

              {/* Message Input */}
              <div className="p-3 bg-card border-t border-border">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2.5 max-w-2xl mx-auto">
                  <Input 
                    placeholder="Type a message..." 
                    value={newMessage} 
                    onChange={(e) => setNewMessage(e.target.value)} 
                    disabled={sending} 
                    className="rounded-xl bg-muted/50 border-0 text-sm h-11 focus-visible:ring-1 focus-visible:ring-secondary/50" 
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()} size="icon" className="rounded-xl h-11 w-11 gradient-secondary shadow-sm flex-shrink-0">
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-muted/10 p-8">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-xl mb-2">KaamNearby Chat</h3>
              <p className="text-muted-foreground text-sm text-center max-w-xs leading-relaxed">
                Select a conversation from the sidebar to start messaging
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
