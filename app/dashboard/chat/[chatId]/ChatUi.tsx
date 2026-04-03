import { Message } from '@/types';

interface ChatUiProps {
    messages: Message[];
    onSend: (text:string) => void;
}

function ChatUi({messages, onSend} : ChatUiProps) {
  return (
    <div>ChatUi</div>
  )
}

export default ChatUi