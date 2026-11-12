"use client"
import { useState } from "react";

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [enter, setEnter] = useState(false);

  // THIS NA YOUR SECRET PASSWORD - CHANGE AM!
  const MY_PASSWORD = "1234";

  if (!enter) {
    return (
      <div style={{padding: 30, background: "black", color: "white", minHeight: "100vh"}}>
        <h1>Ibomnova Control Centre</h1>
        <p>Enter Password</p>
        <input 
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{padding: 10, width: "100%", marginTop: 10}}
          placeholder="Type 1234"
        />
        <button
          onClick={() => {
            if(pass === MY_PASSWORD) setEnter(true);
            else alert("Wrong password");
          }}
          style={{padding: 10, background: "white", color: "black", width: "100%", marginTop: 10}}
        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <div style={{padding: 30, background: "black", color: "white", minHeight: "100vh"}}>
      <h1>Welcome Boss!</h1>
      <p>Total Money: ₦0</p>
      <p>Total Users: 0</p>
      <p>Paystack Key: pk_test_...</p>
    </div>
  );
}
