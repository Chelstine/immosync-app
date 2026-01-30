'use client';
import { useEffect, useState } from 'react';
import AnnonceCard from '@/components/annonces/AnnonceCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Link from 'next/link';

export default function MesAnnoncesPage() {
    const [annonces, setAnnonces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/annonces')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAnnonces(data);
                }
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Spinner /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Mes Annonces ({annonces.length})</h1>
                <Link href="/nouveau-bien">
                    <Button>+ Nouveau Bien</Button>
                </Link>
            </div>

            {annonces.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow">
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore d'annonces.</p>
                    <Link href="/nouveau-bien">
                        <Button>Créer mon premier bien</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {annonces.map(annonce => (
                        <AnnonceCard key={annonce.id} annonce={annonce} />
                    ))}
                </div>
            )}
        </div>
    );
}
