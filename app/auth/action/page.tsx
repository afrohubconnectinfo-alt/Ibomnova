"use client"
import { useState } from "react"
import { getAuth, confirmPasswordReset } from "firebase/auth"
export default function Page(){
const [password,setPassword]=useState("")
const [done,setDone]=useState(false)
const reset=async()=>{
const code=new URLSearchParams(window.location.search).get("oobCode")||""
await confirmPasswordReset(getAuth(),code,password)
setDone(true)
}
if(done) return <div style={{textAlign:'center',padding:'50px'}}><h1>Password Changed ✅</h1><a href="/login">Go Login</a></div>
return <div style={{padding:'30px'}}><h1>Ibomnova - Reset Password</h1><input type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'15px',width:'100%'}} /><button onClick={reset} style={{padding:'15px',background:'#6C5CE7',color:'white',width:'100%',marginTop:'10px'}}>Change Am</button></div>
}
