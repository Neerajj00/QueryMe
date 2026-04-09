import { ChatCard } from "@/components/chat-ui/chat-card";



interface EmptyUiProps{
  username: string;
    onSend: (text:string) => void;
}

function EmptyUi({username, onSend} : EmptyUiProps) {
    return (
        <div
          className=" flex h-full w-full flex-row items-center justify-center "
        >
    
            <ChatCard userName={username} />
        
    
        </div>
      )
}

export default EmptyUi

