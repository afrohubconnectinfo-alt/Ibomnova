"use client"
import { useState } from "react"
import { getAuth, confirmPasswordReset } from "firebase/auth"
import { initializeApp, getApps } from "firebase/app"

const firebaseConfig = {
  apiKey: "AIzaSyCIjfg0XnJNlDnutG-8z0hzOH2Pun3Odog",
  authDomain: "ibomnova.firebaseapp.com",
  projectId: "ibomnova",
  storageBucket: "ibomnova.firebasestorage.app",
  messagingSenderId: "271815396164",
  appId: "1:271815396164:web:0d6b220c5881b984192511"
}

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export default function Page() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const reset = async () => {
    setError("")
    const code = new URLSearchParams(window.location.search).get("oobCode") || ""
    if (!code) { setError("This password reset link is missing or invalid. Request a new link."); return }
    if (password.length < 6) { setError("Your password must contain at least 6 characters."); return }
    if (password !== confirm) { setError("The passwords do not match."); return }
    setLoading(true)
    try {
      await confirmPasswordReset(getAuth(firebaseApp), code, password)
      setDone(true)
    } catch (e: any) {
      setError(e?.code === "auth/expired-action-code" ? "This reset link has expired. Request a new one." : e?.code === "auth/invalid-action-code" ? "This reset link is invalid or has already been used." : "We could not reset your password. Please request a new link and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) return <main style={{maxWidth:420,margin:"12vh auto",padding:24,textAlign:"center"}}><h1>Password changed</h1><p>Your IbomNova password has been updated.</p><a href="/login.html">Go to login</a></main>

  return <main style={{maxWidth:420,margin:"8vh auto",padding:24,fontFamily:"Arial,sans-serif"}}>
    <h1>Reset your IbomNova password</h1>
    <p>Choose a new password with at least 6 characters.</p>
    {error && <p role="alert" style={{color:"#b42318",padding:10,background:"#fff0f0",borderRadius:8}}>{error}</p>}
    <label>New password</label>
    <input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:"block",width:"100%",padding:14,margin:"8px 0 16px",boxSizing:"border-box"}} />
    <label>Confirm new password</label>
    <input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{display:"block",width:"100%",padding:14,margin:"8px 0 16px",boxSizing:"border-box"}} />
    <button onClick={reset} disabled={loading} style={{width:"100%",padding:14,background:"#176b38",color:"white",border:0,borderRadius:8}}>{loading ? "Updating..." : "Change password"}</button>
    <p><a href="/login.html">Back to login</a></p>
  </main>
}
