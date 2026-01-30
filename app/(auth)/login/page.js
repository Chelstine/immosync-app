'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import ParticleLogo from '@/components/ui/ParticleLogo';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('Email ou mot de passe incorrect');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column: Form */}
            <div className="flex items-center justify-center p-8 bg-white overflow-y-auto z-10 shadow-xl">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-left">
                        <h1 className="text-3xl font-extrabold text-blue-900">Novek AI</h1>
                        <p className="mt-2 text-gray-600">Connectez-vous à votre espace agent</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        <Input
                            label="Email Professionnel"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="agent@agence.com"
                        />

                        <Input
                            label="Mot de passe"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <Button type="submit" className="w-full text-lg py-3" isLoading={loading}>
                            Se connecter
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            Pas encore de compte ?{' '}
                            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Créer un compte
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Particle Animation */}
            <div className="relative hidden lg:block bg-gray-50 overflow-hidden">
                {/* We place ParticleLogo absolutely to fill the container */}
                <div className="absolute inset-0">
                    <ParticleLogo />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-50 z-0 pointer-events-none"></div>

                <div className="absolute bottom-10 left-10 z-10 max-w-lg pointer-events-none select-none">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4 drop-shadow-sm">L'immobilier, <br />Propulsé par l'IA.</h2>
                    <p className="text-gray-600 text-lg drop-shadow-sm">Générez, diffusez et synchronisez vos annonces en un clin d'œil.</p>
                </div>
            </div>
        </div>
    );
}
