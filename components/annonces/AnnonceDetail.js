'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Copy, Check, MapPin, Home, Euro, Maximize } from 'lucide-react';

export default function AnnonceDetail({ annonce }) {
    const [copied, setCopied] = useState(false);
    const bien = annonce.bienDetails || {};

    const handleCopy = () => {
        const text = `TITRE:\n${annonce.Titre_Généré}\n\nDESCRIPTION:\n${annonce.Description_Générée}\n\nLien: ${window.location.href}`;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Col: Photos & Details */}
            <div className="space-y-6">
                <div className="bg-gray-200 rounded-xl overflow-hidden aspect-video relative">
                    {bien.Photos && bien.Photos.length > 0 ? (
                        <img src={bien.Photos[0].url} className="w-full h-full object-cover" alt="Main" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">Pas de photos du bien</div>
                    )}
                </div>
                {/* Grid of other photos if any */}
                {bien.Photos && bien.Photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                        {bien.Photos.slice(1).map((p, i) => (
                            <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                <img src={p.url} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}

                <Card>
                    <h3 className="text-lg font-semibold mb-4">Caractéristiques</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center text-gray-700">
                            <Euro size={18} className="mr-2 text-blue-600" />
                            <span className="font-bold">{bien.Prix} €</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Maximize size={18} className="mr-2 text-blue-600" />
                            <span>{bien.Surface} m²</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Home size={18} className="mr-2 text-blue-600" />
                            <span>{bien.Pieces} pièces</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                            <MapPin size={18} className="mr-2 text-blue-600" />
                            <span>{bien.Ville}</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            DPE: {bien.DPE}
                        </span>
                        <span className="ml-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {bien.Type_Bien}
                        </span>
                    </div>
                </Card>
            </div>

            {/* Right Col: Annonce Text & Actions */}
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                        {annonce.Titre_Généré}
                    </h1>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold text-gray-700">Description générée</h2>
                        <Button onClick={handleCopy} variant="outline">
                            {copied ? <><Check size={16} className="mr-2" /> Copié !</> : <><Copy size={16} className="mr-2" /> Copier texte</>}
                        </Button>
                    </div>
                    <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
                        {annonce.Description_Générée}
                    </div>
                </div>

                <Card>
                    <h3 className="text-lg font-semibold mb-4">Publication Multi-Canal</h3>
                    <PublicationSection annonce={annonce} />
                </Card>
            </div>
        </div>
    );
}

function PublicationSection({ annonce }) {
    const [platforms, setPlatforms] = useState({
        facebook: false,
        seloger: false,
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    const handlePublish = async () => {
        setLoading(true);
        setStatus(null);
        try {
            const res = await fetch('/api/annonces/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    annonceId: annonce.id,
                    platforms: platforms
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setStatus({ type: 'success', message: 'Publication réussie !' });
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                    <input
                        type="checkbox"
                        checked={platforms.facebook}
                        onChange={(e) => setPlatforms({ ...platforms, facebook: e.target.checked })}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={annonce.Publié_Facebook}
                    />
                    <span className={annonce.Publié_Facebook ? "text-green-600 font-medium flex items-center" : "text-gray-700 font-medium"}>
                        {annonce.Publié_Facebook ? <><Check size={16} className="mr-1" /> Sur Facebook Marketplace</> : "Facebook Marketplace"}
                    </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
                    <input
                        type="checkbox"
                        checked={platforms.seloger}
                        onChange={(e) => setPlatforms({ ...platforms, seloger: e.target.checked })}
                        className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        disabled={annonce.Publié_SeLoger}
                    />
                    <span className={annonce.Publié_SeLoger ? "text-green-600 font-medium flex items-center" : "text-gray-700 font-medium"}>
                        {annonce.Publié_SeLoger ? <><Check size={16} className="mr-1" /> Sur SeLoger</> : "SeLoger"}
                    </span>
                </label>
            </div>

            {status && (
                <div className={`p-3 rounded-md text-sm border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {status.message}
                </div>
            )}

            <Button
                onClick={handlePublish}
                className="w-full"
                disabled={!platforms.facebook && !platforms.seloger}
                isLoading={loading}
            >
                Publier la sélection
            </Button>
        </div>
    );
}
