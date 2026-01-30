'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ParticleLogo from '@/components/ui/ParticleLogo';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de l\'inscription');
            }

            router.push('/login?registered=true');
        } catch (err) {
            setError(err.message);
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
                        <p className="mt-2 text-gray-600">Créez votre compte agent</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        <Input
                            label="Nom complet"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Jean Dupont"
                        />

                        <Input
                            label="Email Professionnel"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <Input
                            label="Mot de passe (min 8 car.)"
                            type="password"
                            required
                            minLength={8}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />

                        <Input
                            label="Confirmer le mot de passe"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        />

                        <Button type="submit" className="w-full text-lg py-3" isLoading={loading}>
                            Créer compte
                        </Button>

                        <div className="text-center text-sm text-gray-600">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Se connecter
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Particle Animation */}
            <div className="relative hidden lg:block bg-gray-50 overflow-hidden">
                <div className="absolute inset-0">
                    <ParticleLogo />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-transparent opacity-50 z-0 pointer-events-none"></div>
                <div className="absolute bottom-10 left-10 z-10 max-w-lg pointer-events-none select-none">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4 drop-shadow-sm">Rejoignez l'élite.</h2>
                    <p className="text-gray-600 text-lg drop-shadow-sm">Plus d'annonces, moins d'effort, plus de ventes.</p>
                </div>
            </div>
        </div>
    );
}
