import { ChatCard } from "@/components/chat-ui/chat-card";



interface EmptyUiProps{
    onSend: (text:string) => void;
}

function EmptyUi({onSend} : EmptyUiProps) {
    return (
        <div
          className=" flex h-full w-full flex-row items-center justify-center "
        >
    
            <ChatCard userName="Juan" onBackgroundChange={()=>{}} onResetBackground={()=>{}} />
        
    
        </div>
      )
}

export default EmptyUi

