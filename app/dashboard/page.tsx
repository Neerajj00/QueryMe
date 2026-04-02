import { Show, UserButton } from '@clerk/nextjs'
import React from 'react'

function page() {
  return (
    <div><Show when="signed-in">
    <UserButton/>
  </Show></div>
  )
}

export default page