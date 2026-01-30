'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hand } from 'lucide-react';

export default function OnboardingGuide() {
    const [step, setStep] = useState(0);
    const router = useRouter();

    useEffect(() => {
        const isDone = localStorage.getItem('immosync_onboarding_step') === 'done';
        if (isDone) return;

        // Simple logic: if not done, check URL
        // Window location is reliable in useEffect
        if (window.location.pathname === '/settings') {
            setStep(2);
        } else {
            setStep(1);
        }
    }, [router]); // Re-run when router changes (navigation)

    if (step === 0) return null;

    if (step === 1) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Bg overlay needs to be pointer-events-auto to block clicks elsewhere if we want modal behavior,
                     OR pointer-events-none if we want them to click sidebar.
                     User wants: "Guide the person... so they know...".
                     The user said: "ne bouge pas et meme quand on veut passer ca bouge pas".
                     "ne bouge pas" = maybe animation is stuck?
                     "veut passer ca bouge pas" = clicking "Passer" does nothing?
                     
                     Fix 1: Add pointer-events-auto to the modal box itself so button is clickable.
                     Fix 2: Ensure the parent container allows clicks on children.
                 */}

                <div className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm" style={{ pointerEvents: 'auto' }} />

                <div className="relative z-50 bg-white p-6 rounded-xl shadow-2xl max-w-sm text-center animate-bounce-in pointer-events-auto">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Bienvenue sur ImmoSync ! 👋</h3>
                    <p className="text-gray-600 mb-4">Pour commencer à diffuser vos annonces, vous devez d'abord configurer vos comptes.</p>

                    <div className="flex justify-center my-4 animate-bounce">
                        <Hand size={48} className="text-blue-600 rotate-90" />
                    </div>

                    <p className="font-semibold text-blue-700">Cliquez sur "Paramètres" dans le menu</p>

                    {/* If we block everything, they can't click Settings.
                        So we must allow clicking SIDEBAR.
                        Strategy: Close this modal when they click "Passer" OR make this modal non-blocking but annoying?
                        Better: Just a modal telling them what to do, then they click X or "OK". 
                        But the instruction says "Guide...".
                        Let's make "Passer" work reliably first.
                    */}

                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent issues
                            setStep(0);
                            localStorage.setItem('immosync_onboarding_step', 'done');
                        }}
                        className="mt-4 text-sm text-gray-400 underline hover:text-gray-600 cursor-pointer block mx-auto py-2"
                    >
                        Passer le tutoriel
                    </button>

                    <button
                        onClick={() => setStep(0)}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full"
                    >
                        J'ai compris, je vais aux paramètres
                    </button>
                </div>
            </div>
        );
    }

    if (step === 2) {
        return (
            <div className="fixed bottom-10 right-10 z-50 pointer-events-none">
                <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg flex items-center space-x-4 animate-pulse">
                    <Hand size={32} />
                    <div>
                        <p className="font-bold">Remplissez ces informations !</p>
                        <p className="text-sm opacity-90">Sauvegardez pour activer la multi-diffusion.</p>
                    </div>
                </div>
            </div>
        );
    }
}
