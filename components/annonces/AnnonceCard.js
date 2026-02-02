import Link from 'next/link';
import { Calendar, CheckCircle, Trash2 } from 'lucide-react';

export default function AnnonceCard({ annonce }) {
    const dateStr = annonce.Date_Génération ? new Date(annonce.Date_Génération).toLocaleDateString('fr-FR') : 'Date inconnue';
    const title = annonce.Titre_Généré ? (annonce.Titre_Généré.length > 80 ? annonce.Titre_Généré.substring(0, 80) + '...' : annonce.Titre_Généré) : 'Sans titre';
    const desc = annonce.Description_Générée ? (annonce.Description_Générée.length > 100 ? annonce.Description_Générée.substring(0, 100) + '...' : annonce.Description_Générée) : 'Pas de description';

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
            <div className="h-48 bg-gray-200 relative flex-shrink-0">
                {annonce.Photo_Bien && annonce.Photo_Bien.length > 0 ? (
                    <img src={annonce.Photo_Bien[0].url} alt={title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 text-sm flex-col">
                        <svg className="h-8 w-8 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <span>Pas de photo</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                    {/* Facebook */}
                    {annonce.Publié_Facebook ? (
                        <span title="Publié Facebook" className="bg-blue-600 p-1.5 rounded-full text-white shadow-sm border border-transparent"><CheckCircle size={14} strokeWidth={3} /></span>
                    ) : (annonce.Facebook_Request && (
                        <span title="En attente Facebook" className="bg-orange-100 p-1.5 rounded-full text-orange-600 animate-pulse border border-orange-200"><CheckCircle size={14} className="opacity-50" /></span>
                    ))}

                    {/* LeBonCoin */}
                    {annonce.Publié_LBC ? (
                        <span title="Publié LBC" className="bg-orange-500 p-1.5 rounded-full text-white shadow-sm border border-transparent"><CheckCircle size={14} strokeWidth={3} /></span>
                    ) : (annonce.LBC_Request && (
                        <span title="En attente LBC" className="bg-orange-100 p-1.5 rounded-full text-orange-600 animate-pulse border border-orange-200"><CheckCircle size={14} className="opacity-50" /></span>
                    ))}

                    {/* SeLoger */}
                    {annonce.Publié_SeLoger ? (
                        <span title="Publié SeLoger" className="bg-blue-100 p-1.5 rounded-full text-blue-800 shadow-sm border border-transparent"><CheckCircle size={14} strokeWidth={3} /></span>
                    ) : (annonce.SeLoger_Request && (
                        <span title="En attente SeLoger" className="bg-orange-100 p-1.5 rounded-full text-orange-600 animate-pulse border border-orange-200"><CheckCircle size={14} className="opacity-50" /></span>
                    ))}
                </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden" style={{ maxHeight: '3.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{title}</h3>
                <p className="text-sm text-gray-500 mb-4 overflow-hidden flex-1" style={{ maxHeight: '5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{desc}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t">
                    <span className="flex items-center text-xs text-gray-400">
                        <Calendar size={12} className="mr-1" />
                        {dateStr}
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                if (!confirm('Supprimer cette annonce ?')) return;
                                try {
                                    const res = await fetch(`/api/annonces/${annonce.id}`, { method: 'DELETE' });
                                    if (res.ok) window.location.reload();
                                } catch (err) { alert('Erreur suppression'); }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                            title="Supprimer"
                        >
                            <Trash2 size={16} />
                        </button>
                        <Link
                            href={`/annonce/${annonce.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            Voir détails →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
