import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Pin,
  Trash2,
  Plus,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Brain,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Button from "@/components/ui/button";
import Avatar from "@/components/ui/avatar";
import Badge from "@/components/ui/badge";
import Spinner from "@/components/ui/spinner";
import { apiClient } from "@/api/client";
import toast from "react-hot-toast";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  attachments?: { name: string; type: "image" | "pdf"; url?: string }[];
}

interface Conversation {
  id: string;
  title: string;
  date: string;
  isPinned: boolean;
}

interface BackendConversation {
  id: string;
  title: string;
  updatedAt: string;
  messages?: BackendMessage[];
}

interface BackendMessage {
  id: string;
  sender: "USER" | "AI";
  content: string;
  createdAt: string;
}

const NEW_CHAT_ID = "new-chat";

const formatTime = (value: string | Date) =>
  new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatDateLabel = (value: string) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const createGreetingMessage = (): Message => ({
  id: "greeting-message",
  sender: "ai",
  text: "Halo! Saya adalah **EduCouns AI**, asisten konseling psikologismu.\n\nCeritakan apa yang sedang kamu rasakan hari ini. Saya akan membantu dengan empatik dan privat.",
  timestamp: formatTime(new Date()),
});

const mapBackendMessages = (items: BackendMessage[]): Message[] =>
  items.map((item) => ({
    id: item.id,
    sender: item.sender === "AI" ? "ai" : "user",
    text: item.content,
    timestamp: formatTime(item.createdAt),
  }));

export const AIChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>(NEW_CHAT_ID);
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    [NEW_CHAT_ID]: [createGreetingMessage()],
  });
  const [inputText, setInputText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingConversationDetail, setIsLoadingConversationDetail] =
    useState(false);
  const [attachedFiles, setAttachedFiles] = useState<
    { name: string; type: "image" | "pdf" }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatId, isAiTyping]);

  const activeMessages = messages[activeChatId] || [];

  const openConversation = async (conversationId: string) => {
    setIsLoadingConversationDetail(true);
    try {
      const response = await apiClient.get(
        `/v1/ai/conversations/${conversationId}`,
      );
      const conversation: BackendConversation = response.data.data;

      setMessages((prev) => ({
        ...prev,
        [conversationId]: mapBackendMessages(conversation.messages || []),
      }));
      setActiveChatId(conversationId);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal memuat detail percakapan.",
      );
    } finally {
      setIsLoadingConversationDetail(false);
    }
  };

  const loadConversations = async (preferredConversationId?: string) => {
    setIsLoadingConversations(true);
    try {
      const response = await apiClient.get("/v1/ai/conversations");
      const items: BackendConversation[] = response.data.data || [];

      setConversations(
        items.map((item) => ({
          id: item.id,
          title: item.title || "Percakapan Baru",
          date: formatDateLabel(item.updatedAt),
          isPinned: false,
        })),
      );

      const targetId = preferredConversationId || items[0]?.id;
      if (targetId) {
        await openConversation(targetId);
      } else {
        setActiveChatId(NEW_CHAT_ID);
        setMessages((prev) => ({
          ...prev,
          [NEW_CHAT_ID]: [createGreetingMessage()],
        }));
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal memuat riwayat percakapan AI.",
      );
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) {
      toast.error("Pesan teks wajib diisi sebelum dikirim ke AI.");
      return;
    }

    const currentKey = activeChatId || NEW_CHAT_ID;
    const messageText = inputText.trim();
    const attachmentsSnapshot = [...attachedFiles];
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: formatTime(new Date()),
      attachments:
        attachmentsSnapshot.length > 0 ? attachmentsSnapshot : undefined,
    };

    setMessages((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] || []), userMessage],
    }));
    setInputText("");
    setAttachedFiles([]);
    setIsAiTyping(true);

    if (attachmentsSnapshot.length > 0) {
      toast(
        "Lampiran belum dikirim ke backend AI. Saat ini hanya teks yang diproses.",
      );
    }

    try {
      const response = await apiClient.post("/v1/ai/chat", {
        conversationId: currentKey === NEW_CHAT_ID ? null : currentKey,
        message: messageText,
      });

      const backendConversationId: string = response.data.data.conversationId;
      const aiMessage: Message = {
        id: response.data.data.message.id,
        sender: "ai",
        text: response.data.data.response.message,
        timestamp: formatTime(new Date()),
      };

      setMessages((prev) => {
        const currentMessages = prev[currentKey] || [];
        const nextMessages = {
          ...prev,
          [backendConversationId]: [...currentMessages, aiMessage],
        };

        if (currentKey !== backendConversationId) {
          delete nextMessages[currentKey];
        }

        return nextMessages;
      });

      setActiveChatId(backendConversationId);
      await loadConversations(backendConversationId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengirim pesan ke AI.");
      setMessages((prev) => ({
        ...prev,
        [currentKey]: (prev[currentKey] || []).filter(
          (message) => message.id !== userMessage.id,
        ),
      }));
    } finally {
      setIsAiTyping(false);
    }
  };

  const startNewChat = () => {
    setActiveChatId(NEW_CHAT_ID);
    setInputText("");
    setAttachedFiles([]);
    setMessages((prev) => ({
      ...prev,
      [NEW_CHAT_ID]: [createGreetingMessage()],
    }));
  };

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id
          ? { ...conversation, isPinned: !conversation.isPinned }
          : conversation,
      ),
    );
    toast.success("Pin percakapan diperbarui di tampilan ini.");
  };

  const deleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/v1/ai/conversations/${id}`);
      setConversations((prev) =>
        prev.filter((conversation) => conversation.id !== id),
      );
      setMessages((prev) => {
        const nextMessages = { ...prev };
        delete nextMessages[id];
        return nextMessages;
      });

      if (activeChatId === id) {
        startNewChat();
      }

      toast.success("Riwayat chat berhasil dihapus.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus percakapan.");
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      if (!isImg && !isPdf) {
        toast.error("Hanya mendukung file gambar (PNG, JPG) atau PDF.");
        return;
      }
      setAttachedFiles((prev) => [
        ...prev,
        { name: file.name, type: isImg ? "image" : "pdf" },
      ]);
      toast.success(`File ${file.name} terlampir.`);
    }
  };

  const toggleVoiceInput = () => {
    setIsRecording((prev) => {
      const next = !prev;
      if (next) {
        toast.success("Perekaman suara dimulai...");
        setTimeout(() => {
          setInputText("Saya merasa stres karena ujian matematika besok pagi.");
          setIsRecording(false);
          toast.success("Suara berhasil dikonversi ke teks.");
        }, 3000);
      } else {
        toast.success("Perekaman dibatalkan.");
      }
      return next;
    });
  };

  const handlePromptClick = (text: string) => {
    setInputText(text);
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pinnedChats = filteredConversations.filter(
    (conversation) => conversation.isPinned,
  );
  const unpinnedChats = filteredConversations.filter(
    (conversation) => !conversation.isPinned,
  );

  const prompts = [
    {
      label: "Cemas Menghadapi Ujian",
      text: "Saya merasa sangat cemas menghadapi ujian semester besok.",
    },
    {
      label: "Mengatur Jadwal Belajar",
      text: "Bagaimana menyusun jadwal Pomodoro belajar yang seimbang?",
    },
    {
      label: "Mengatasi Sulit Tidur",
      text: "Saya sering insomnia karena banyak pikiran, bantu saya rileks.",
    },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] w-full flex bg-card border border-border rounded-2xl overflow-hidden glass relative">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25 }}
            className="shrink-0 h-full border-r border-border bg-card/60 flex flex-col z-20 absolute md:relative left-0 top-0 bottom-0"
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={startNewChat}
                leftIcon={<Plus className="h-4 w-4" />}
                className="w-full justify-start h-10 rounded-xl"
              >
                Chat Baru
              </Button>
            </div>

            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari chat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-card pl-9 pr-3 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-4">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : (
                <>
                  {pinnedChats.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-wider block">
                        Pinned Chats
                      </span>
                      {pinnedChats.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => openConversation(conversation.id)}
                          className={`
                            group flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-200
                            ${conversation.id === activeChatId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
                          `}
                        >
                          <div className="flex items-center gap-2 truncate text-left">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate w-36">
                              {conversation.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => togglePin(conversation.id, e)}
                              className="p-1 rounded-full hover:bg-muted text-foreground cursor-pointer"
                            >
                              <Pin className="h-3 w-3 fill-current text-primary" />
                            </button>
                            <button
                              onClick={(e) => deleteChat(conversation.id, e)}
                              className="p-1 rounded-full hover:bg-muted text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-wider block">
                      Riwayat Percakapan
                    </span>
                    {unpinnedChats.length > 0 ? (
                      unpinnedChats.map((conversation) => (
                        <div
                          key={conversation.id}
                          onClick={() => openConversation(conversation.id)}
                          className={`
                            group flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors duration-200
                            ${conversation.id === activeChatId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}
                          `}
                        >
                          <div className="flex items-center gap-2 truncate text-left">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate w-36">
                              {conversation.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => togglePin(conversation.id, e)}
                              className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Pin className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => deleteChat(conversation.id, e)}
                              className="p-1 rounded-full hover:bg-muted text-destructive cursor-pointer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60 block px-2 py-1">
                        Belum ada percakapan tersimpan.
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full bg-background/30 relative">
        <button
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="absolute left-4 top-4 z-30 p-2 rounded-xl border border-border bg-card text-foreground hover:bg-muted/50 cursor-pointer shadow-sm"
          aria-label="Toggle chat sidebar"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        <div className="h-16 border-b border-border flex items-center justify-center relative">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">EduCouns AI Assistant</span>
            <Badge variant="success" className="text-[9px] px-1.5 py-0">
              Online
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoadingConversationDetail ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="sm" />
            </div>
          ) : (
            <>
              <AnimatePresence>
                {activeMessages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"}`}
                    >
                      <Avatar
                        fallback={isUser ? "ME" : "AI"}
                        size="sm"
                        className={
                          isUser
                            ? "bg-primary/20 text-primary"
                            : "bg-gradient-to-tr from-primary to-secondary text-primary-foreground"
                        }
                      />
                      <div className="space-y-1.5">
                        <div
                          className={`
                            p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed text-left shadow-sm
                            ${isUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border text-foreground rounded-tl-none markdown-container"}
                          `}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          ) : (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          )}

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 space-y-1.5 pt-2 border-t border-white/10">
                              {msg.attachments.map((file, idx) => (
                                <div
                                  key={idx}
                                  className={`flex items-center gap-2 p-2 rounded-xl text-xs ${isUser ? "bg-black/10 text-white" : "bg-muted/40 text-muted-foreground"}`}
                                >
                                  {file.type === "image" ? (
                                    <ImageIcon className="h-4 w-4" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                  <span className="truncate w-40 font-medium">
                                    {file.name}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-muted-foreground/60 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isAiTyping && (
                <div className="flex gap-3 max-w-[85%] mr-auto text-left">
                  <Avatar
                    fallback="AI"
                    size="sm"
                    className="bg-gradient-to-tr from-primary to-secondary text-primary-foreground"
                  />
                  <div className="bg-card border border-border rounded-2xl rounded-tl-none p-3.5 flex items-center justify-center">
                    <Spinner size="sm" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {activeMessages.length <= 1 && !isAiTyping && (
          <div className="px-4 py-2 space-y-2 max-w-xl mx-auto w-full text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Saran Topik Konseling AI
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {prompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="p-3 border border-border bg-card/50 hover:bg-muted/50 rounded-2xl text-[11px] font-semibold text-foreground/80 cursor-pointer transition-colors duration-200 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3 shrink-0 text-amber-500" />
                  <span className="truncate">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-border bg-card/65 backdrop-blur-sm"
        >
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary"
                >
                  {file.type === "image" ? (
                    <ImageIcon className="h-3.5 w-3.5" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  <span className="truncate max-w-[120px] font-medium">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachedFiles((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                    className="ml-1 text-primary hover:text-foreground cursor-pointer focus:outline-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />

            <button
              type="button"
              onClick={handleFileUploadClick}
              className="p-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted/50 transition-all duration-200"
              aria-label="Attach file"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </button>

            <input
              type="text"
              placeholder="Ceritakan apa saja kepada EduCouns AI..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 h-11 rounded-xl border border-border bg-card/50 px-4 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />

            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 rounded-xl border border-border cursor-pointer transition-all duration-200 ${
                isRecording
                  ? "bg-destructive border-destructive text-destructive-foreground animate-pulse"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
              aria-label="Voice input"
            >
              {isRecording ? (
                <MicOff className="h-4.5 w-4.5" />
              ) : (
                <Mic className="h-4.5 w-4.5" />
              )}
            </button>

            <button
              type="submit"
              disabled={!inputText.trim() || isAiTyping}
              className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-md disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
