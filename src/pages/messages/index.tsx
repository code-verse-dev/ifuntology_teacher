import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Send,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAdminAccountQuery, useGetMyStudentsQuery } from "@/redux/services/apiSlices/invitationSlice";
import {
  chatSlice,
  useGetChatsQuery,
  useCreateChatMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
} from "@/redux/services/apiSlices/chatSlice";
import { UPLOADS_URL } from "@/constants/api";
import { toast } from "sonner";
import socket from "@/config/socket";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

export default function MessagesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const openStudentId = (location.state as { studentUserId?: string } | null)?.studentUserId;
  const user = useSelector((state: any) => state.user.userData);
  const currentUserId = user?._id;

  const [selectedTab, setSelectedTab] = React.useState("student");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [studentSearchQuery, setStudentSearchQuery] = React.useState("");
  const [inputText, setInputText] = React.useState("");

  const { data: adminAccountData } = useGetAdminAccountQuery();
  const { data: myStudentsData } = useGetMyStudentsQuery({ page: 1, limit: 1000 });
  const { data: chatsData, isLoading: chatsLoading } = useGetChatsQuery({
    keyword: searchQuery || undefined,
  });
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();

  const adminAccount = adminAccountData?.data;
  const myStudents: any[] = Array.isArray(myStudentsData?.data?.docs) ? myStudentsData.data.docs : [];

  const chatsDocs: any[] = chatsData?.data?.docs ?? [];
  const chats = chatsDocs;

  const contacts = React.useMemo(() => {
    if (selectedTab === "student") {
      return myStudents.map((t: any) => ({
        _id: t.user?._id,
        firstName: t.user?.firstName,
        lastName: t.user?.lastName,
        name: `${t.user?.firstName ?? ""} ${t.user?.lastName ?? ""}`.trim() || "Student",
        image: t.user?.image,
      }));
    }
    if (selectedTab === "admin" && adminAccount) {
      return [
        {
          _id: adminAccount._id,
          firstName: adminAccount.firstName,
          lastName: adminAccount.lastName,
          name: `${adminAccount.firstName ?? ""} ${adminAccount.lastName ?? ""}`.trim() || "Admin",
          image: adminAccount.image,
        },
      ];
    }
    return [];
  }, [selectedTab, myStudents, adminAccount]);

  const filteredContacts = React.useMemo(() => {
    if (selectedTab !== "student" || !studentSearchQuery.trim()) return contacts;
    const q = studentSearchQuery.trim().toLowerCase();
    return contacts.filter(
      (c: any) =>
        (c.firstName ?? "").toLowerCase().includes(q) ||
        (c.lastName ?? "").toLowerCase().includes(q) ||
        (c.name ?? "").toLowerCase().includes(q)
    );
  }, [contacts, selectedTab, studentSearchQuery]);

  const getChatForContact = (contactId: string) => {
    return chats.find(
      (c: any) =>
        (c.sender === currentUserId && c.receiver === contactId) ||
        (c.receiver === currentUserId && c.sender === contactId)
    );
  };

  const [selectedContact, setSelectedContact] = React.useState<any>(null);
  const [selectedChat, setSelectedChat] = React.useState<any>(null);
  const [creatingForContact, setCreatingForContact] = React.useState<string | null>(null);

  const activeChatId = selectedChat?._id;
  const { data: messagesData, isLoading: messagesLoading } = useGetMessagesQuery(
    { chatId: activeChatId ?? "" },
    { skip: !activeChatId }
  );

  const messagesRaw = messagesData?.data;
  const [messages, setMessages] = React.useState<any[]>([]);

   React.useEffect(() => {
    if (messagesRaw) {
      let messages = Array.isArray(messagesRaw)
        ? messagesRaw
        : Array.isArray(messagesRaw?.docs)
        ? messagesRaw.docs
        : messagesRaw?.docs
        ? messagesRaw.docs
        : [];
      setMessages(messages);
    }
   }, [messagesRaw]);

  const sortedMessages = React.useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages]
  );

  React.useEffect(() => {
    socket.on("message", (newMessage) => {
      if (newMessage.chat === activeChatId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("message");
    };

  }, [activeChatId, socket]);
  
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();



  const handleSelectContact = async (contact: any) => {
    setSelectedContact(contact);
    let chat = getChatForContact(contact._id);
    if (chat) {
      setSelectedChat(chat);
      return;
    }
    setCreatingForContact(contact._id);
    try {
      const res: any = await createChat({
        sender: currentUserId!,
        receiver: contact._id,
      }).unwrap();
      if (res?.data) {
        setSelectedChat(res.data);
      }
    } catch {
      setSelectedChat(null);
    } finally {
      setCreatingForContact(null);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !activeChatId || isSending) return;
    try {
      const res: any = await sendMessage({ chatId: activeChatId, content: text }).unwrap();
      if (res?.status) {
        const createdMessage = res.data;
        socket.emit("message", {
          ...createdMessage,
          sender: currentUserId,
          receiver: selectedContact._id,
        });
        setMessages([...messages, createdMessage]);
        setInputText("");
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message;
      toast.error(message || "Something went wrong");
    }
  };

  const otherParty = selectedChat
    ? currentUserId === selectedChat.sender
      ? selectedChat.receiverDoc
      : selectedChat.senderDoc
    : selectedContact;

  const displayName = otherParty
    ? `${otherParty.firstName ?? ""} ${otherParty.lastName ?? ""}`.trim() || "User"
    : "";

  React.useEffect(() => {
    document.title = "Chats • iFuntology Teacher";
  }, []);

  React.useEffect(() => {
    if (openStudentId) {
      setSelectedTab("student");
    }
  }, [openStudentId]);

  const handleSelectContactRef = React.useRef(handleSelectContact);
  handleSelectContactRef.current = handleSelectContact;

  React.useEffect(() => {
    if (!openStudentId || contacts.length === 0) return;
    const contact = contacts.find((c: any) => c._id === openStudentId);
    if (contact) {
      handleSelectContactRef.current(contact);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [openStudentId, contacts, navigate, location.pathname]);

  React.useEffect(() => {
    if (openStudentId || contacts.length === 0) return;
    const first = contacts[0];
    const shouldSelectFirst =
      !selectedContact || !contacts.some((c: any) => c._id === selectedContact._id);
    if (shouldSelectFirst) {
      handleSelectContactRef.current(first);
    }
  }, [selectedTab, contacts, openStudentId, selectedContact]);

  return (
    <DashboardWithSidebarLayout>
      <div className="-mx-4 -mt-8 -mb-10 sm:-mx-6 flex h-[calc(100vh-6rem)]">
          {/* Sidebar */}
          <div className="w-80 xl:w-96 shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Chats</h2>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="w-full grid grid-cols-2 mb-4 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger
                    value="student"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"
                  >
                    Students
                  </TabsTrigger>
                  <TabsTrigger
                    value="admin"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none"
                  >
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              {selectedTab === "student" && (
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Emma Wilson"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="pl-9 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  />
                </div>
              )}
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {chatsLoading && contacts.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {selectedTab === "student" && studentSearchQuery
                      ? "No students match your search."
                      : `No ${selectedTab === "student" ? "students" : "admin"} available.`}
                  </div>
                ) : (
                  filteredContacts.map((contact) => {
                    const chat = getChatForContact(contact?._id);
                    const isSelected = selectedContact?._id === contact?._id;
                    const isCreating = creatingForContact === contact?._id;

                    return (
                      <button
                        key={contact?._id}
                        onClick={() => handleSelectContact(contact)}
                        disabled={isCreating}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                          isSelected
                            ? "bg-orange-50 dark:bg-orange-950/30"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12">
                            {contact?.image ? (
                              <AvatarImage src={UPLOADS_URL + contact?.image} alt={contact?.name} />
                            ) : null}
                            <AvatarFallback className="bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                              {contact?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {contact?.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {isCreating ? "Starting chat…" : chat ? "Chat" : "Start conversation"}
                          </p>
                        </div>
                        {isCreating && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
            {!selectedContact ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start messaging.
              </div>
            ) : (
              <>
                <div className="shrink-0 flex items-center justify-between px-6 py-4 bg-orange-50 dark:bg-orange-950/30 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {otherParty?.image ? (
                        <AvatarImage src={UPLOADS_URL + otherParty.image} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="bg-orange-200 dark:bg-orange-800 text-orange-700 dark:text-orange-200">
                        {displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{displayName}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Online
                      </p>
                    </div>
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div> */}
                </div>

                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                    {messagesLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : sortedMessages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No messages yet. Say hello!
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const groups: { date: string; items: any[] }[] = [];
                          let lastDate = "";
                          for (const msg of sortedMessages) {
                            const d = formatDate(msg.createdAt);
                            if (d !== lastDate) {
                              lastDate = d;
                              groups.push({ date: d, items: [msg] });
                            } else {
                              groups[groups.length - 1].items.push(msg);
                            }
                          }
                          return groups.map((g) => (
                            <div key={g.date}>
                              <div className="flex justify-center mb-4">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                                  {g.date}
                                </span>
                              </div>
                              <div className="space-y-4">
                                {g.items.map((msg) => {
                                  const isMe =
                                    msg?.sender?._id === currentUserId || msg?.sender?._id === currentUserId;
                                  const senderName = msg?.sender?.firstName
                                    ? `${msg.sender?.firstName} ${msg.sender?.lastName}`.trim()
                                    : "User";

                                  return (
                                    <div
                                      key={msg._id}
                                      className={cn(
                                        "flex gap-2",
                                        isMe ? "flex-row-reverse" : "flex-row"
                                      )}
                                    >
                                      {!isMe && (
                                        <Avatar className="h-8 w-8 shrink-0">
                                          {msg?.sender?.image ? (
                                            <AvatarImage
                                              src={UPLOADS_URL + msg?.sender?.image}
                                              alt={senderName}
                                            />
                                          ) : null}
                                          <AvatarFallback className="text-xs bg-orange-200 dark:bg-orange-800">
                                            {senderName.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                      {isMe && <div className="w-8 shrink-0" />}
                                      <div
                                        className={cn(
                                          "max-w-[75%] rounded-2xl px-4 py-2.5",
                                          isMe
                                            ? "bg-slate-100 dark:bg-slate-800"
                                            : "bg-orange-50 dark:bg-orange-950/30"
                                        )}
                                      >
                                        <p className="text-sm text-slate-800 dark:text-slate-200">
                                          {msg.content}
                                        </p>
                                        <div
                                          className={cn(
                                            "flex items-center justify-end gap-1 mt-1",
                                            isMe ? "flex-row" : "flex-row-reverse"
                                          )}
                                        >
                                          <span className="text-[10px] text-muted-foreground">
                                            {formatTime(msg.createdAt)}
                                          </span>
                                          {isMe && (
                                            <CheckCheck className="h-3.5 w-3.5 text-orange-500" />
                                          )}
                                        </div>
                                      </div>
                                      {isMe && (
                                        <Avatar className="h-8 w-8 shrink-0">
                                          <AvatarFallback className="text-xs bg-slate-400 dark:bg-slate-600">
                                            Me
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ));
                        })()}
                      </>
                    )}
                  </div>
                </ScrollArea>

                <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="max-w-2xl mx-auto flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2">
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                      <Smile className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Input
                    placeholder="e.g. Hi Emma, please review chapter 3 before Friday…"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {/* <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    </Button> */}
                    <Button
                      size="icon"
                      className="rounded-full shrink-0 bg-orange-500 hover:bg-orange-600"
                      onClick={handleSend}
                      disabled={!inputText.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <Send className="h-5 w-5 text-white" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
    </DashboardWithSidebarLayout>
  );
}
