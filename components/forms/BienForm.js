'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const bienSchema = z.object({
    Type_Bien: z.enum(['Appartement', 'Maison', 'Terrain']),
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
            if (photos.length + newPhotos.length > 10) {
                alert('Max 10 photos');
                return;
            }
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
            // Append photos
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
        <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Col 1 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
                            <select {...register('Type_Bien')} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                <option value="Appartement">Appartement</option>
                                <option value="Maison">Maison</option>
                                <option value="Terrain">Terrain</option>
                            </select>
                            {errors.Type_Bien && <p className="text-red-500 text-sm">{errors.Type_Bien.message}</p>}
                        </div>

                        <Input
                            label="Prix (€)"
                            type="number"
                            {...register('Prix')}
                            error={errors.Prix?.message}
                        />

                        <Input
                            label="Surface (m²)"
                            type="number"
                            {...register('Surface')}
                            error={errors.Surface?.message}
                        />

                        <Input
                            label="Nombre de pièces"
                            type="number"
                            {...register('Pieces')}
                            error={errors.Pieces?.message}
                        />
                    </div>

                    {/* Col 2 */}
                    <div className="space-y-4">
                        <Input
                            label="Ville"
                            {...register('Ville')}
                            error={errors.Ville?.message}
                        />

                        <Input
                            label="Code Postal"
                            {...register('Code_Postal')}
                            error={errors.Code_Postal?.message}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">DPE</label>
                            <select {...register('DPE')} className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            {errors.DPE && <p className="text-red-500 text-sm">{errors.DPE.message}</p>}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description courte / Points clés</label>
                    <textarea
                        {...register('Description_Courte')}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-24"
                        placeholder="Ex: Vue mer, rénové, calme, proche gare..."
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photos ({photos.length}/10)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer relative">
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Télécharger des photos</span>
                                    <input type="file" className="sr-only" multiple accept="image/*" onChange={handlePhotoUpload} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                        </div>
                    </div>

                    {photos.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                            {photos.map((photo, idx) => (
                                <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={URL.createObjectURL(photo)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                        onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(idx)}
                                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-50 text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button type="submit" isLoading={loading} className="w-full md:w-auto">
                        Créer et Générer Annonce
                    </Button>
                </div>
            </form>
        </Card>
    );
}
