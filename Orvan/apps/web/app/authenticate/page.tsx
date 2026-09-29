'use client';

import { useState } from "react";







export default function auth(){
    const [username, Setusername] = useState("")
    return(
        <div>
            <div>
                <input type="number" placeholder="John Doe" value={username} onChange={(e) => Setusername(e.target.value)} 
                    className = "bg-red-200"/>
            </div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    )
}