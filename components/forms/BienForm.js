'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Upload, X, ChevronDown, Sparkles, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';

const bienSchema = z.object({
    Type_Bien: z.enum(['Appartement', 'Maison', 'Terrain', 'Local Commercial', 'Parking / Box', 'Immeuble']).optional(),
    Type_Autre: z.string().optional(),
    Prix: z.coerce.number().min(1, 'Prix requis'),
    Surface: z.coerce.number().min(9, 'Surface requise (>9m²)'),
    Pieces: z.coerce.number().optional(), // Made optional globally, but UI logic will handle it
    Ville: z.string().min(2, 'Ville requise'),
    Code_Postal: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
    DPE: z.string().min(1, 'Requis'),
    Ton: z.enum(['Professionnel', 'Luxe', 'Amical', 'Urgent', 'Informatif']),
    Description_Courte: z.string().optional(),
}).refine((data) => {
    // Custom validation: Pieces is required if not a Terrain
    if (data.Type_Bien !== 'Terrain' && !data.Pieces) {
        return false;
    }
    return true;
}, {
    message: "Le nombre de pièces est requis pour ce type de bien",
    path: ["Pieces"]
});

export default function BienForm() {
    const router = useRouter();
    const [photos, setPhotos] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]); // Added state for preview URLs
    const [loading, setLoading] = useState(false);
    const [isCustomType, setIsCustomType] = useState(false); // Added state for custom type

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ // Added watch and setValue
        resolver: zodResolver(bienSchema),
        defaultValues: {
            Type_Bien: 'Appartement',
            DPE: 'D',
            Ton: 'Professionnel'
        }
    });

    const typeBienValue = watch('Type_Bien'); // Watch Type_Bien value

    // Handle Image Selection
    const handleImageChange = (e) => { // Renamed from handlePhotoUpload
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setPhotos(prev => [...prev, ...newFiles]);

            // Generate previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviews]);
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index)); // Also remove from previewUrls
    };

    const onSubmit = async (data) => {
        console.log("Submitting form...", data);
        setLoading(true);
        try {
            const formData = new FormData();

            Object.keys(data).forEach(key => {
                if (key !== 'photos') {
                    if (key === 'Type_Bien' && isCustomType) {
                        formData.append('Type_Bien', data.Type_Autre || 'Autre');
                    } else if (key !== 'Type_Autre') {
                        formData.append(key, data[key]);
                    }
                }
            });

            photos.forEach(photo => formData.append('photos', photo));

            const res = await fetch('/api/biens', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Erreur création');
            }

            router.push('/mes-annonces');
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la création du bien: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, (errors) => console.log('Validation Errors:', errors))} className="space-y-8">
            <Card className="p-8">
                <div className="border-b pb-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Nouveau Bien</h2>
                    <p className="text-gray-500 mt-1">Dites-nous en plus sur le bien à vendre/louer.</p>
                </div>

                {/* 2 Columns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left Column */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de bien</label>
                            <div className="relative">
                                {!isCustomType ? (
                                    <select
                                        {...register('Type_Bien')}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'Autre_Custom') {
                                                setIsCustomType(true);
                                                setValue('Type_Bien', '');
                                            } else {
                                                setValue('Type_Bien', val);
                                            }
                                        }}
                                        className="appearance-none w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 text-black bg-gray-50 hover:bg-white transition-all cursor-pointer"
                                    >
                                        <option value="Appartement">Appartement</option>
                                        <option value="Maison">Maison</option>
                                        <option value="Terrain">Terrain</option>
                                        <option value="Local Commercial">Local Commercial</option>
                                        <option value="Parking / Box">Parking / Box</option>
                                        <option value="Immeuble">Immeuble</option>
                                        <option value="Autre_Custom" className="font-bold text-blue-600">+ Autre (Saisir manuellement)</option>
                                    </select>
                                ) : (
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            {...register('Type_Autre')}
                                            placeholder="Ex: Château, Péniche..."
                                            className="flex-1 rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 text-black bg-white"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setIsCustomType(false); setValue('Type_Bien', 'Appartement'); }}
                                            className="p-3 text-gray-500 hover:text-red-500"
                                            title="Revenir à la liste"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                                {!isCustomType && (
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            {errors.Type_Bien && <p className="mt-1 text-sm text-red-600">{errors.Type_Bien.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ville</label>
                            <Input {...register('Ville')} placeholder="Ex: Lyon" error={errors.Ville?.message} />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Code Postal</label>
                            <Input {...register('Code_Postal')} placeholder="69002" error={errors.Code_Postal?.message} maxLength={5} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (€)</label>
                                <Input {...register('Prix')} type="number" placeholder="250000" error={errors.Prix?.message} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Surface (m²)</label>
                                <Input {...register('Surface')} type="number" placeholder="45" error={errors.Surface?.message} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {typeBienValue !== 'Terrain' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pièces</label>
                                    <Input {...register('Pieces')} type="number" placeholder="3" error={errors.Pieces?.message} />
                                </div>
                            )}
                            <div className={typeBienValue === 'Terrain' ? 'col-span-2' : ''}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">DPE</label>
                                <div className="relative">
                                    <select
                                        {...register('DPE')}
                                        className="appearance-none w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 text-black bg-gray-50 hover:bg-white transition-all cursor-pointer text-center font-bold text-lg"
                                    >
                                        {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                                {errors.DPE && <p className="mt-1 text-sm text-red-600">{errors.DPE.message}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Ton de l'annonce</label>
                            <div className="relative">
                                <select
                                    {...register('Ton')}
                                    className="appearance-none w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4 text-black bg-gray-50 hover:bg-white transition-all cursor-pointer"
                                >
                                    <option value="Professionnel">Professionnel</option>
                                    <option value="Luxe">Luxe & Prestige</option>
                                    <option value="Amical">Amical & Chaleureux</option>
                                    <option value="Urgent">Urgent / Opportunité</option>
                                    <option value="Informatif">Informatif</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                            {errors.Ton && <p className="mt-1 text-sm text-red-600">{errors.Ton.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Description (Full Width - Moved Down) */}
                <div className="mt-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description courte / Points clés (Optionnel)</label>
                    <textarea
                        {...register('Description_Courte')}
                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-[100px] bg-gray-50 hover:bg-white transition-all p-4 resize-none text-black"
                        placeholder="Ex: Vue mer, balcon, cuisine équipée, proche transports..."
                    ></textarea>
                </div>

                {/* Photos Section (Full Width) */}
                <div className="mt-8 border-t pt-8">
                    <label className="block text-lg font-semibold text-gray-900 mb-4">Photos du bien</label>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group shadow-sm bg-gray-100">
                                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-blue-600">
                            <UploadCloud size={32} className="mb-2" />
                            <span className="text-sm font-medium">Ajouter</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-6 border-t">
                    <Button
                        type="submit"
                        isLoading={loading}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-medium text-lg flex items-center"
                    >
                        {loading ? 'Création...' : (
                            <>
                                Générer l'annonce IA
                                <Sparkles className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </div>
            </Card>
        </form>
    );
}
