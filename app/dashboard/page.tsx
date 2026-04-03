import { redirect } from "next/navigation"



// will be using this defualt page as a redirecting page by generating a new id for chat and then redirecting to that page
function page() {
  const chatId = crypto.randomUUID() // generate a new unique id for the chat

  redirect(`/dashboard/chat/${chatId}`) // redirect to the new chat page with the generated id

}

export default page