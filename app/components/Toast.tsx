"use client";

import { useEffect, useState } from "react";

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
}

export default function Toast({ message, show, onClose }: ToastProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show && !visible) return null;

    return (
        <div className={`fixed bottom-8 right-8 z-[10000] transition-all duration-300 ease-out transform ${visible ? "translate-x-0 opacity-100 scale-100" : "translate-x-4 opacity-0 scale-95"
            }`}>
            <div className="bg-white px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center space-x-4 min-w-[320px]">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <span className="text-[15px] font-bold text-navy tracking-tight">{message}</span>
            </div>
        </div>
    );
}
