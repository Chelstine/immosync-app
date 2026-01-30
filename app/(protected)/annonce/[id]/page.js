'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import AnnonceDetail from '@/components/annonces/AnnonceDetail';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function AnnoncePage({ params }) {
    const router = useRouter();
    const { id } = use(params);
    const [annonce, setAnnonce] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/annonces/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Erreur ou accès interdit');
                return res.json();
            })
            .then(data => {
                setAnnonce(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;
    if (error) return (
        <div className="text-center p-20">
            <h2 className="text-xl text-red-600 mb-4">{error}</h2>
            <Button onClick={() => router.push('/mes-annonces')}>Retour à mes annonces</Button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 mb-4 font-medium flex items-center">
                ← Retour
            </button>
            <AnnonceDetail annonce={annonce} />
        </div>
    );
}
