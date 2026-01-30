'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const bienSchema = z.object({
    Type_Bien: z.enum(['Appartement', 'Maison', 'Terrain', 'Local']),
    Prix: z.coerce.number().min(1, 'Prix requis'),
    Surface: z.coerce.number().min(9, 'Surface requise (>9m²)'),
    Pieces: z.coerce.number().min(1, 'Pièces requises'),
    Ville: z.string().min(2, 'Ville requise'),
    Code_Postal: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    DPE: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']),
    Description_Courte: z.string().optional(),
});

export default function BienForm() {
    const router = useRouter();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(bienSchema),
        defaultValues: {
            Type_Bien: 'Appartement',
            DPE: 'D',
        }
    });

    const handlePhotoUpload = (e) => {
        if (e.target.files) {
            const newPhotos = Array.from(e.target.files);
            setPhotos([...photos, ...newPhotos]);
        }
    };

    const removePhoto = (index) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key]));
            photos.forEach(photo => formData.append('photos', photo));

            const res = await fetch('/api/biens', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Erreur création');
            router.push('/mes-annonces');
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la création du bien');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-100/50">
                <h2 className="text-3xl font-extrabold text-blue-900 mb-8 pb-4 border-b border-gray-100">Nouveau Bien Immobilier</h2>

                {/* Characteristics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {/* Column 1 */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de Bien</label>
                            <div className="relative">
                                <select
                                    {...register('Type_Bien')}
                                    className="appearance-none w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-4 px-5 text-base text-black bg-gray-50/50 hover:bg-white transition-all cursor-pointer"
                                >
                                    <option value="Appartement" className="text-black">Appartement</option>
                                    <option value="Maison" className="text-black">Maison</option>
                                    <option value="Terrain" className="text-black">Terrain</option>
                                    <option value="Local" className="text-black">Local Commercial</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <Input
                            label="Prix (€)"
                            type="number"
                            {...register('Prix')}
                            error={errors.Prix?.message}
                            className="bg-gray-50/50 hover:bg-white text-lg font-medium text-black rounded-2xl border-gray-200 py-4"
                        />

                        <Input
                            label="Surface (m²)"
                            type="number"
                            {...register('Surface')}
                            error={errors.Surface?.message}
                            className="bg-gray-50/50 hover:bg-white text-lg font-medium text-black rounded-2xl border-gray-200 py-4"
                        />

                        <Input
                            label="Nombre de pièces"
                            type="number"
                            {...register('Pieces')}
                            error={errors.Pieces?.message}
                            className="bg-gray-50/50 hover:bg-white text-lg font-medium text-black rounded-2xl border-gray-200 py-4"
                        />
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        <Input
                            label="Ville"
                            {...register('Ville')}
                            error={errors.Ville?.message}
                            className="bg-gray-50/50 hover:bg-white text-lg font-medium text-black rounded-2xl border-gray-200 py-4"
                        />
                        <Input
                            label="Code Postal"
                            {...register('Code_Postal')}
                            error={errors.Code_Postal?.message}
                            className="bg-gray-50/50 hover:bg-white text-lg font-medium text-black rounded-2xl border-gray-200 py-4"
                        />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description courte / Points clés</label>
                            <textarea
                                {...register('Description_Courte')}
                                className="w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[170px] bg-gray-50/50 hover:bg-white transition-all p-5 resize-none text-base text-black"
                                placeholder="Ex: Vue mer imprenable, entièrement rénové, quartier calme, proche gare..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* DPE as Select */}
                <div className="mt-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnostic de Performance Énergétique (DPE)</label>
                    <div className="relative">
                        <select
                            {...register('DPE')}
                            className="appearance-none w-full rounded-2xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-4 px-5 text-base text-black bg-gray-50/50 hover:bg-white transition-all cursor-pointer"
                        >
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(d => (
                                <option key={d} value={d} className="text-black">Classe {d}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Photos Full Width */}
                <div className="mt-10 pt-10 border-t border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Photos ({photos.length})</label>
                    <div className="mt-1 flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-blue-200/50 rounded-2xl hover:bg-blue-50/30 transition-all cursor-pointer relative bg-blue-50/10 group">
                        <div className="space-y-2 text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="flex flex-col text-sm text-gray-600">
                                <label className="relative cursor-pointer rounded-md font-bold text-blue-700 hover:text-blue-500 focus-within:outline-none text-lg">
                                    <span>Cliquez pour ajouter des photos</span>
                                    <input type="file" className="sr-only" multiple accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                                <p className="text-gray-400 mt-2">PNG, JPG, WEBP jusqu'à 10MB</p>
                            </div>
                        </div>
                    </div>

                    {photos.length > 0 && (
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-6">
                            {photos.map((photo, idx) => (
                                <div key={idx} className="relative group aspect-square bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                                    <img
                                        src={URL.createObjectURL(photo)}
                                        alt="Preview"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(idx)}
                                        className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full p-2 shadow-lg hover:bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100">
                    <Button type="submit" isLoading={loading} className="w-full py-5 text-xl font-bold shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-900/20 hover:scale-[1.01] transition-all bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl">
                        Générer l'annonce IA ✨
                    </Button>
                </div>
            </div>
        </form>
    );
}
