'use client';
import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);

    // State for all platforms
    const [facebook, setFacebook] = useState({ pageId: '', token: '' });
    const [lbc, setLbc] = useState({ login: '', password: '' });
    const [seloger, setSeloger] = useState({ login: '', password: '' });
    const [bienici, setBienici] = useState({ login: '', password: '' });

    // On mount, maybe we could fetch existing settings IF we had a GET endpoint.
    // For now, it's write-only or user re-enters.

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // We need a new endpoint to save these to Airtable Users
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facebook,
                    lbc,
                    seloger,
                    bienici
                })
            });

            if (!res.ok) throw new Error('Erreur sauvegarde');

            // Mark onboarding as complete in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('immosync_onboarding_step', 'done');
            }
            alert('Paramètres sauvegardés avec succès !');

        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <h1 className="text-3xl font-bold text-gray-900">Paramètres de Publication</h1>
            <p className="text-gray-600">Configurez vos comptes pour activer la multi-diffusion.</p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Facebook */}
                <Card className="border-t-4 border-blue-600">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">f</span>
                        Facebook Marketplace
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="ID de la Page"
                            placeholder="Ex: 1000555..."
                            value={facebook.pageId}
                            onChange={e => setFacebook({ ...facebook, pageId: e.target.value })}
                        />
                        <Input
                            label="Token d'accès"
                            type="password"
                            placeholder="EAA..."
                            value={facebook.token}
                            onChange={e => setFacebook({ ...facebook, token: e.target.value })}
                        />
                    </div>
                </Card>

                {/* Le Bon Coin */}
                <Card className="border-t-4 border-orange-500">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2">L</span>
                        Le Bon Coin
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="Email de connexion"
                            type="email"
                            placeholder="compte@leboncoin.fr"
                            value={lbc.login}
                            onChange={e => setLbc({ ...lbc, login: e.target.value })}
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            value={lbc.password}
                            onChange={e => setLbc({ ...lbc, password: e.target.value })}
                        />
                    </div>
                </Card>

                {/* SeLoger */}
                <Card className="border-t-4 border-red-600">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-2">S</span>
                        SeLoger / MeilleursAgents
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="Identifiant Pro"
                            placeholder="ID Client"
                            value={seloger.login}
                            onChange={e => setSeloger({ ...seloger, login: e.target.value })}
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            value={seloger.password}
                            onChange={e => setSeloger({ ...seloger, password: e.target.value })}
                        />
                    </div>
                </Card>

                {/* Bien'ici */}
                <Card className="border-t-4 border-yellow-500">
                    <h2 className="text-lg font-bold mb-4 flex items-center">
                        <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-2">B</span>
                        Bien'ici
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="Email / ID"
                            placeholder="compte@bienici.com"
                            value={bienici.login}
                            onChange={e => setBienici({ ...bienici, login: e.target.value })}
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            value={bienici.password}
                            onChange={e => setBienici({ ...bienici, password: e.target.value })}
                        />
                    </div>
                </Card>

                <div className="md:col-span-2 pt-4">
                    <Button type="submit" isLoading={loading} className="w-full text-lg py-4">
                        Sauvegarder les configurations
                    </Button>
                </div>
            </form>
        </div>
    );
}
