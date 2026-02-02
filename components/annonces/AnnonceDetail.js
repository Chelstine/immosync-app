'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Copy, Check, MapPin, Home, Euro, Maximize, Edit, Share2, Loader2, Download, Send, CheckCircle, Facebook, ShoppingBag, AlertTriangle } from 'lucide-react';

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
            setStatus({ type: 'success', message: '🚀 Demande envoyée ! L\'agent va traiter la publication.' });
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine status
    const getStatus = (platformKey) => {
        // Normalisation des clés pour correspondre aux champs Airtable (ex: 'Publié_Facebook', 'Publié_SeLoger')
        const fieldKey = `Publié_${platformKey.charAt(0).toUpperCase() + platformKey.slice(1)}`;
        const requestKey = `${platformKey}Request`; // ex: facebookRequest (Attention: lbcRequest / LBC_Request ? Vérifier modèle. Souvent 'LBC_Request')

        // Fix spécifique pour LBC qui a souvent des variantes de nommage
        const isPublished = annonce[fieldKey] || (platformKey === 'lbc' && annonce['Publié_LBC']);
        const isPending = (annonce[requestKey] || (platformKey === 'lbc' && annonce['LBC_Request'])) && !isPublished;

        if (isPublished) return { label: 'En Ligne', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle };
        if (isPending) return { label: 'Traitement...', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Loader2 };
        return { label: 'Non diffusé', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: null };
    };

    const platformConfig = {
        facebook: { label: 'Facebook Marketplace', icon: Facebook, color: 'blue', desc: 'Portée massive, gratuit.' },
        lbc: { label: 'LeBonCoin', icon: ShoppingBag, color: 'orange', desc: 'Leader immo, haute intention.' },
        seloger: { label: 'SeLoger', icon: Home, color: 'rose', desc: 'Portail pro spécialisé.' },
        bienici: { label: "Bien'ici", icon: MapPin, color: 'indigo', desc: 'Recherche par carte 3D.' }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* --- HEADER --- */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-gray-50 to-white">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Share2 className="text-blue-600" size={24} />
                        Diffusion Multi-Canal
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Sélectionnez les portails où diffuser cette annonce.</p>
                </div>

                <div className="flex items-center gap-3">
                    {loading ? (
                        <div className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2 text-gray-600 animate-pulse">
                            <Loader2 size={18} className="animate-spin" /> Envoi en cours...
                        </div>
                    ) : (
                        <>
                            <a
                                href="/download"
                                target="_blank"
                                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                            >
                                <Download size={16} /> L'Assistant est-il prêt ?
                            </a>
                            <Button
                                onClick={handlePublish}
                                disabled={Object.values(platforms).every(v => !v)}
                                className={`
                                    py-2 px-6 shadow-lg shadow-blue-500/20 active:scale-95 transition-all
                                    ${Object.values(platforms).every(v => !v) ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                                `}
                            >
                                <Send size={18} className="mr-2" />
                                Diffuser Maintenant
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* --- GRID --- */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {Object.entries(platformConfig).map(([key, config]) => {
                    const status = getStatus(key);
                    const isPublished = status.label === 'En Ligne';
                    const isPending = status.label === 'Traitement...';
                    const isSelected = platforms[key];
                    const Icon = config.icon;

                    // Dynamic styles based on color theme
                    const themeColors = {
                        blue: 'border-blue-500 bg-blue-50/50 text-blue-700',
                        orange: 'border-orange-500 bg-orange-50/50 text-orange-700',
                        rose: 'border-rose-500 bg-rose-50/50 text-rose-700',
                        indigo: 'border-indigo-500 bg-indigo-50/50 text-indigo-700',
                    }[config.color];

                    return (
                        <div
                            key={key}
                            onClick={() => !isPublished && !isPending && setPlatforms(p => ({ ...p, [key]: !p[key] }))}
                            className={`
                                group relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col gap-4 select-none
                                ${isPublished ? 'border-green-200 bg-green-50/30 opacity-75 grayscale-[0.3]' :
                                    isPending ? 'border-amber-200 bg-amber-50/30' :
                                        isSelected ? `${themeColors} shadow-md scale-[1.02]` :
                                            'border-gray-100 hover:border-gray-300 hover:shadow-sm bg-white'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className={`p-2.5 rounded-lg ${isSelected || isPublished ? 'bg-white shadow-sm' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'} transition-colors`}>
                                    <Icon size={24} className={isSelected || isPublished ? `text-${config.color}-600` : ''} />
                                </div>

                                {/* Status Badge */}
                                <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border flex items-center gap-1.5 ${status.color}`}>
                                    {status.icon && <status.icon size={12} className={status.icon === Loader2 ? "animate-spin" : ""} />}
                                    {status.label}
                                </span>
                            </div>

                            <div>
                                <h3 className={`font-bold text-lg ${isSelected ? `text-${config.color}-900` : 'text-gray-700'}`}>{config.label}</h3>
                                <p className="text-xs text-gray-500 mt-1 font-medium">{config.desc}</p>
                            </div>

                            {/* Checkbox Visual - Only actionable if not already processing/done */}
                            {!isPublished && !isPending && (
                                <div className={`absolute bottom-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? `bg-${config.color}-500 border-${config.color}-500 scale-110` : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                                    <CheckCircle size={14} className={`text-white transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- FOOTER STATUS --- */}
            {status && (
                <div className={`mx-6 mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200 shadow-sm' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    <div className={`p-2 rounded-full ${status.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <div>
                        <p className="font-bold">{status.type === 'success' ? 'Succès' : 'Erreur'}</p>
                        <p className="text-sm opacity-90">{status.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
