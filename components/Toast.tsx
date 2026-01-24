"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface ToastContextType {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);
    let nextId = 0;

    const addToast = (message: string, type: ToastType) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{
            success: (msg) => addToast(msg, "success"),
            error: (msg) => addToast(msg, "error"),
            info: (msg) => addToast(msg, "info")
        }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 20, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            className={`pointer-events-auto min-w-[280px] p-4 rounded-xl shadow-lg border flex items-center gap-3 ${toast.type === 'success' ? 'bg-white border-emerald-100 text-emerald-800' :
                                    toast.type === 'error' ? 'bg-white border-rose-100 text-rose-800' :
                                        'bg-white border-slate-100 text-slate-800'
                                }`}
                        >
                            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    toast.type === 'error' ? 'bg-rose-100 text-rose-600' :
                                        'bg-slate-100 text-slate-600'
                                }`}>
                                {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                                    toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                                        <Info className="w-4 h-4" />}
                            </div>
                            <p className="text-sm font-semibold flex-1">{toast.message}</p>
                            <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}
