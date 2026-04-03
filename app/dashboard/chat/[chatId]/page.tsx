import {Message} from "@/types";
import ChatClient from "./ChatClient";

async function page({params}: {params: { chatId: string}}) {

    const {chatId} = params;
    
    // const messages : Message[] = await getMessages(chatId);
    const messages : Message[] = [];

    return <ChatClient chatId={chatId} initialMessages={messages} />
  
}

export default page