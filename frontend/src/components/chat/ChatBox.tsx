import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Label } from "../ui/label";
import {
  ArrowUp,
  ChevronDown,
  CircleCheck,
  Languages,
  MessageCircle,
  SquarePen,
  ZoomIn,
} from "lucide-react";
import { Input } from "../ui/input";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/axios";

function Message({ messages }: { messages: any }) {
  return (
    <div className="flex justify-end gap-2">
      <Label className="bg-muted max-w-[60%] rounded-lg px-4 py-2">
        {messages || "None"}
      </Label>
    </div>
  );
}

function SuggestionOptions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="ghost"
        size="xs"
        className="text-muted-foreground bg-muted/50 hover:bg-muted rounded-full"
      >
        Suggestion 1
      </Button>
      <Button
        variant="ghost"
        size="xs"
        className="text-muted-foreground bg-muted/50 hover:bg-muted rounded-full"
      >
        Suggestion 2
      </Button>
      <Button
        variant="ghost"
        size="xs"
        className="text-muted-foreground bg-muted/50 hover:bg-muted rounded-full"
      >
        Suggestion 3
      </Button>
    </div>
  );
}

function Response({ response }: { response: any }) {
  return (
    <div className="flex flex-col justify-start gap-2">
      <Label className="max-w-[80%] rounded-lg px-4 py-2">{response}</Label>
      <SuggestionOptions />
    </div>
  );
}

function WelcomeScreen() {
  const options = [
    { icon: "🦆", label: "Tự động đặt phòng" },
    { icon: <Languages className="h-4 w-4" />, label: "Tự động mượn thiết bị" },
    {
      icon: <ZoomIn className="h-4 w-4" />,
      label: "Các thiết bị gần đến hạn và chưa trả.",
    },
    {
      icon: <CircleCheck className="h-4 w-4" />,
      label: "Các thiết bị đã mượn.",
    },
  ];

  return (
    <div className="flex flex-col gap-2 p-1">
      <h2 className="text-foreground/90 mb-4 px-2 text-xl font-semibold tracking-tight">
        How can I help you today?
      </h2>
      <div className="flex flex-col gap-0.5">
        {options.map((option, index) => (
          <Button
            key={index}
            variant="ghost"
            className="hover:bg-muted/60 flex w-full items-center justify-start gap-3 rounded-lg px-2 py-5 text-sm transition-colors"
          >
            <span className="flex h-5 w-5 items-center justify-center">
              {option.icon}
            </span>
            <span className="text-muted-foreground text-sm font-medium">
              {option.label}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
}

function Conversation({
  messages,
  response,
}: {
  messages: any;
  response: any;
}) {
  return (
    <div className="flex flex-col gap-2 pb-4">
      <Message messages={messages} />
      <Response response={response} />
    </div>
  );
}

function InputChat({ setMessageContainer }: { setMessageContainer: any }) {
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;

    console.log("message: ", message);
    const response = await api.post("/chat", { content: message });
    console.log("response: ", response);
    setMessageContainer((prev: any) => [
      ...prev,
      { message, response: response.data },
    ]);
    setMessage("");
  };

  return (
    <div className="flex w-full items-center justify-between gap-2 p-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim()) {
            handleSend();
          }
        }}
        placeholder="Type your message here..."
        className="focus-visible:ring-0"
      />
      <Button
        disabled={!message.trim()}
        onClick={handleSend}
        className="rounded-full"
      >
        <ArrowUp className="h-full w-full rounded-full" />
      </Button>
    </div>
  );
}

function ChatBox() {
  const [isOpen, setIsOpen] = useState(true);
  const [messageContainer, setMessageContainer] = useState([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    // Cho phép sai số 10px để đảm bảo không bị giật khi scroll (các OS/Browser zoom khác nhau dẫn đến sai số phần thập phân)
    const isBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    const isTop = target.scrollTop <= 10;

    setIsAtBottom(isBottom);
    setIsAtTop(isTop);
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Tự động kéo xuống dưới đáy nếu có tin nhắn mới
    scrollToBottom();
  }, [messageContainer]);

  return (
    <AnimatePresence mode="wait">
      {!isOpen ? (
        <motion.div
          key="chat-btn"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed right-10 bottom-10 z-50 rounded-full border"
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-background text-foreground h-16 w-16 rounded-full transition-all hover:scale-110 hover:shadow active:scale-95"
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="chat-window"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ originX: 1, originY: 1 }}
          className="chat-box fixed right-10 bottom-10 z-50 h-fit w-90 rounded-xl"
        >
          <Card className="w-full p-0">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-2">
              <Label className="font-semibold">AI ChatBox</Label>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMessageContainer([])}
                  className="hover:bg-muted h-8 w-8 rounded-full"
                  title="New Chat"
                >
                  <SquarePen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-muted h-8 w-8 rounded-full"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="relative h-88 overflow-hidden px-1 py-1">
              <div className="from-card pointer-events-none absolute top-0 right-0 left-0 z-10 h-12 bg-linear-to-b to-transparent" />

              <ScrollArea
                className="h-full w-full px-4 py-0"
                onScrollCapture={handleScroll}
              >
                {messageContainer.length === 0 ? (
                  <WelcomeScreen />
                ) : (
                  messageContainer.map((item: any, index: number) => (
                    <Conversation
                      key={index}
                      messages={item.message}
                      response={item.response}
                    />
                  ))
                )}
                <div ref={endOfMessagesRef} className="h-1 w-full" />
              </ScrollArea>

              {/* Hiệu ứng làm mờ ở trên cùng */}

              {/* Hiệu ứng làm mờ và nút Chevron tròn như Notion AI */}
              {!isAtBottom && (
                <div className="from-card pointer-events-none absolute right-0 bottom-0 left-0 flex h-24 items-end justify-center bg-linear-to-t to-transparent pb-4">
                  <Button
                    size="icon"
                    className="bg-foreground text-background pointer-events-auto h-8 w-8 rounded-full shadow-md shadow-black/20 transition-all hover:scale-105 active:scale-95"
                    onClick={scrollToBottom}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="w-full p-0">
              <InputChat setMessageContainer={setMessageContainer} />
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ChatBox;
