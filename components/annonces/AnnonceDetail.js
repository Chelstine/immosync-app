'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Copy, Check, MapPin, Home, Euro, Maximize, Edit } from 'lucide-react';

export default function AnnonceDetail({ annonce }) {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitre, setEditedTitre] = useState(annonce.Titre_Généré);
    const [editedDesc, setEditedDesc] = useState(annonce.Description_Générée);
    const bien = annonce.bienDetails || {};

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/annonces/${annonce.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ titre: editedTitre, description: editedDesc })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert("Erreur lors de la sauvegarde");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        }
    };

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
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-100">
                            <Home size={48} className="mb-2 text-gray-400" />
                            <p>Aucune photo disponible</p>
                            <p className="text-xs text-center mt-1 text-gray-400 px-4">
                                (L'upload nécessite un compte Cloud Storage configuré)
                            </p>
                        </div>
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
                        <div className="flex space-x-2">
                            {isEditing ? (
                                <>
                                    <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                        Enregistrer
                                    </Button>
                                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                                        Annuler
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" /> Modifier
                                    </Button>
                                    <Button onClick={handleCopy} variant="outline" size="sm">
                                        {copied ? <><Check size={16} className="mr-2" /> Copié !</> : <><Copy size={16} className="mr-2" /> Copier</>}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="space-y-4">
                            <input
                                value={editedTitre}
                                onChange={(e) => setEditedTitre(e.target.value)}
                                className="w-full text-2xl font-bold border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-white"
                            />
                            <textarea
                                value={editedDesc}
                                onChange={(e) => setEditedDesc(e.target.value)}
                                rows={10}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-900 bg-white"
                            />
                        </div>
                    ) : (
                        <div className="prose prose-blue max-w-none text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
                            {annonce.Description_Générée}
                        </div>
                    )}
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
        lbc: false,
        bienici: false
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
                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors border border-transparent hover:border-gray-200">
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

                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors border border-transparent hover:border-gray-200">
                    <input
                        type="checkbox"
                        checked={platforms.lbc}
                        onChange={(e) => setPlatforms({ ...platforms, lbc: e.target.checked })}
                        className="h-5 w-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                        disabled={annonce.Publié_LBC}
                    />
                    <span className={annonce.Publié_LBC ? "text-green-600 font-medium flex items-center" : "text-gray-700 font-medium"}>
                        {annonce.Publié_LBC ? <><Check size={16} className="mr-1" /> Sur Le Bon Coin</> : "Le Bon Coin"}
                    </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors border border-transparent hover:border-gray-200">
                    <input
                        type="checkbox"
                        checked={platforms.seloger}
                        onChange={(e) => setPlatforms({ ...platforms, seloger: e.target.checked })}
                        className="h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        disabled={annonce.Publié_SeLoger}
                    />
                    <span className={annonce.Publié_SeLoger ? "text-green-600 font-medium flex items-center" : "text-gray-700 font-medium"}>
                        {annonce.Publié_SeLoger ? <><Check size={16} className="mr-1" /> Sur SeLoger / MeilleursAgents</> : "SeLoger"}
                    </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors border border-transparent hover:border-gray-200">
                    <input
                        type="checkbox"
                        checked={platforms.bienici}
                        onChange={(e) => setPlatforms({ ...platforms, bienici: e.target.checked })}
                        className="h-5 w-5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
                        disabled={annonce.Publié_BienIci}
                    />
                    <span className={annonce.Publié_BienIci ? "text-green-600 font-medium flex items-center" : "text-gray-700 font-medium"}>
                        {annonce.Publié_BienIci ? <><Check size={16} className="mr-1" /> Sur Bien'ici</> : "Bien'ici"}
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
                disabled={!platforms.facebook && !platforms.seloger && !platforms.lbc && !platforms.bienici}
                isLoading={loading}
            >
                Publier la sélection
            </Button>
        </div>
    );
}
