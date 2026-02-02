'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Copy, Check, MapPin, Home, Euro, Maximize, Edit, Share2 } from 'lucide-react';

export default function AnnonceDetail({ annonce }) {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Annonce States
    const [editedTitre, setEditedTitre] = useState(annonce.Titre_Généré);
    const [editedDesc, setEditedDesc] = useState(annonce.Description_Générée);

    // Bien States (linked data)
    const bien = annonce.bienDetails || {};
    const [editedPrix, setEditedPrix] = useState(bien.Prix);
    const [editedSurface, setEditedSurface] = useState(bien.Surface);
    const [editedPieces, setEditedPieces] = useState(bien.Pieces);
    const [editedVille, setEditedVille] = useState(bien.Ville);
    const [editedDPE, setEditedDPE] = useState(bien.DPE);

    const handleSave = async () => {
        try {
            const res = await fetch(`/api/annonces/${annonce.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    titre: editedTitre,
                    description: editedDesc,
                    // Bien updates
                    bienId: bien.id,
                    prix: editedPrix,
                    surface: editedSurface,
                    pieces: editedPieces,
                    ville: editedVille,
                    dpe: editedDPE
                })
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
                            {isEditing ?
                                <input type="number" value={editedPrix} onChange={e => setEditedPrix(e.target.value)} className="border rounded p-1 w-24" />
                                : <span className="font-bold">{bien.Prix} €</span>
                            }
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Maximize size={18} className="mr-2 text-blue-600" />
                            {isEditing ?
                                <input type="number" value={editedSurface} onChange={e => setEditedSurface(e.target.value)} className="border rounded p-1 w-20" />
                                : <span>{bien.Surface} m²</span>
                            }
                        </div>
                        <div className="flex items-center text-gray-700">
                            <Home size={18} className="mr-2 text-blue-600" />
                            {isEditing ?
                                <input type="number" value={editedPieces} onChange={e => setEditedPieces(e.target.value)} className="border rounded p-1 w-16" />
                                : <span>{bien.Pieces} pièces</span>
                            }
                        </div>
                        <div className="flex items-center text-gray-700">
                            <MapPin size={18} className="mr-2 text-blue-600" />
                            {isEditing ?
                                <input type="text" value={editedVille} onChange={e => setEditedVille(e.target.value)} className="border rounded p-1 w-full" />
                                : <span>{bien.Ville}</span>
                            }
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center gap-2">
                        {isEditing ? (
                            <select value={editedDPE} onChange={e => setEditedDPE(e.target.value)} className="border rounded p-1 text-sm">
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        ) : (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                DPE: {bien.DPE}
                            </span>
                        )}
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
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

            setStatus({ type: 'success', message: 'Demande de publication mise en file d\'attente !' });
            // Optionally, refresh annonce data or update local state to reflect pending status
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setPublishing(false);
        }
    };

    // Helper to determine status
    const getStatus = (platformKey) => {
        const isPublished = annonce[`Publié_${platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}`];
        const isPending = annonce[`${platformKey}Request`] && !isPublished;

        if (isPublished) return { label: 'Publié', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle };
        if (isPending) return { label: 'En attente...', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: Loader2 };
        return { label: 'Non publié', color: 'text-gray-500 bg-gray-50 border-gray-200', icon: null };
    };

    const StatusBadge = ({ platform }) => {
        const { label, color, icon: Icon } = getStatus(platform);
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${color}`}>
                {Icon && <Icon size={12} className={Icon === Loader2 ? "animate-spin" : ""} />}
                {label}
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Share2 className="text-blue-600" size={24} />
                        Diffusion Multi-Canal
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Sélectionnez les plateformes</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                    {loading ? (
                        <div className="flex items-center gap-2 text-blue-600 font-medium">
                            <Loader2 className="animate-spin" /> Traitement...
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <a
                                href="/download"
                                target="_blank"
                                className="text-xs text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 transition-colors"
                            >
                                <Download size={14} /> Installer l'Assistant
                            </a>
                            <Button
                                onClick={handlePublish}
                                disabled={Object.values(platforms).every(v => !v)}
                                className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95"
                            >
                                <Send size={18} className="mr-2" />
                                Lancer
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { id: 'facebook', label: 'Facebook Marketplace', icon: Facebook },
                    { id: 'lbc', label: 'LeBonCoin', icon: ShoppingBag }, // Using generic icon
                    { id: 'seloger', label: 'SeLoger', icon: Home },
                    { id: 'bienici', label: "Bien'ici", icon: MapPin }
                ].map((platform) => {
                    const status = getStatus(platform.id);
                    const isPublished = status.label === 'Publié';
                    const isPending = status.label === 'En attente...';

                    return (
                        <div
                            key={platform.id}
                            onClick={() => !isPublished && !isPending && setPlatforms(prev => ({ ...prev, [platform.id]: !prev[platform.id] }))}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-3
                                ${isPublished ? 'border-green-100 bg-green-50/30 opacity-70 cursor-default' :
                                    isPending ? 'border-orange-100 bg-orange-50/30 cursor-wait' :
                                        platforms[platform.id] ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-2 rounded-lg ${isPublished ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                    <platform.icon size={20} />
                                </div>
                                <StatusBadge platform={platform.id} />
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-700">{platform.label}</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isPublished ? 'En ligne depuis récemment' : isPending ? 'Publication en cours...' : 'Prêt à publier'}
                                </p>
                            </div>

                            {/* Selection Checkbox Visual */}
                            {!isPublished && !isPending && (
                                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedPlatforms[platform.id] ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                                    {selectedPlatforms[platform.id] && <CheckCircle size={14} className="text-white" />}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Status Messages Area */}
            {status && (
                <div className={`mx-6 mb-6 p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}
        </div >
    );
}
