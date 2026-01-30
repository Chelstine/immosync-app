'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hand } from 'lucide-react';

export default function OnboardingGuide() {
    const [step, setStep] = useState(0); // 0: None, 1: Point to Settings (Sidebar), 2: Point to Fields (if on settings)
    const router = useRouter();

    useEffect(() => {
        // Check if onboarding is done
        const isDone = localStorage.getItem('immosync_onboarding_step') === 'done';
        if (isDone) return;

        // Check if we are on settings page
        if (window.location.pathname === '/settings') {
            setStep(2);
        } else {
            // If not on settings, and not done, start step 1
            setStep(1);
        }
    }, [router]);

    if (step === 0) return null;

    if (step === 1) {
        return (
            <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm pointer-events-auto" />

                {/* Highlight Zone for Sidebar Settings Link - approximate position for MD screens */}
                {/* We can't easily know EXACT position of sidebar link without Ref, but we can guide generally */}

                <div className="relative z-50 bg-white p-6 rounded-xl shadow-2xl max-w-sm text-center animate-bounce-in">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Bienvenue sur ImmoSync ! 👋</h3>
                    <p className="text-gray-600 mb-4">Pour commencer à diffuser vos annonces, vous devez d'abord configurer vos comptes.</p>

                    <div className="flex justify-center my-4 animate-bounce">
                        <Hand size={48} className="text-blue-600 rotate-90" /> {/* Pointing Left roughly */}
                    </div>

                    <p className="font-semibold text-blue-700">Cliquez sur "Paramètres" dans le menu</p>

                    <button
                        onClick={() => {
                            setStep(0);
                            localStorage.setItem('immosync_onboarding_step', 'done'); // Dismiss for now if they want
                        }}
                        className="mt-4 text-sm text-gray-400 underline hover:text-gray-600"
                    >
                        Passer le tutoriel
                    </button>
                </div>

                {/* Fake Spotlight on Sidebar area? Hard to do responsively without tailored CSS. 
                    Let's just stick to the modal with the hand. */}
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
