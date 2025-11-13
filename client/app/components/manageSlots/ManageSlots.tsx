'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchSlots, createSlot, updateSlot, deleteSlot, Slot } from '@/app/utils/api/Admin/slots';

const ManageSlots: React.FC = () => {
    const { t } = useTranslation();
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
    const [formName, setFormName] = useState('');
    const [formStartTime, setFormStartTime] = useState('');
    const [formEndTime, setFormEndTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadSlots = async () => {
        setLoading(true);
        const response = await fetchSlots();
        if (response.success) {
            setSlots(response.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadSlots();
    }, []);

    const resetForm = () => {
        setFormName('');
        setFormStartTime('');
        setFormEndTime('');
        setEditingSlot(null);
        setShowForm(false);
    };

    const handleEdit = (slot: Slot) => {
        setEditingSlot(slot);
        setFormName(slot.name);
        setFormStartTime(slot.startTime);
        setFormEndTime(slot.endTime);
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);

        let response;
        if (editingSlot) {
            response = await updateSlot(editingSlot.slotId, formName, formStartTime, formEndTime);
        } else {
            response = await createSlot(formName, formStartTime, formEndTime);
        }

        if (response.success) {
            setMessage({ text: editingSlot ? t('Slot updated.') : t('Slot created.'), type: 'success' });
            resetForm();
            await loadSlots();
        } else {
            setMessage({ text: response.error || t('An error occurred'), type: 'error' });
        }
        setSubmitting(false);
    };

    const handleDelete = async (slotId: string) => {
        if (!confirm(t('Are you sure you want to delete this slot?'))) return;

        setMessage(null);
        const response = await deleteSlot(slotId);
        if (response.success) {
            setMessage({ text: t('Slot deleted.'), type: 'success' });
            await loadSlots();
        } else {
            setMessage({ text: response.error || t('An error occurred'), type: 'error' });
        }
    };

    if (loading) {
        return <div className="p-6 text-gray-500">{t('Loading...')}</div>;
    }

    return (
        <div className="p-6 max-w-2xl">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('Manage Slots')}</h2>
                {!showForm && (
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="bg-indigo-500 hover:bg-indigo-400 text-white font-semibold py-2 px-4 rounded text-sm"
                    >
                        {t('Add Slot')}
                    </button>
                )}
            </div>

            {message && (
                <div className={`p-3 rounded mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 mb-6 border">
                    <h3 className="font-semibold mb-3">{editingSlot ? t('Edit Slot') : t('New Slot')}</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('Name')}</label>
                            <input
                                type="text"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                placeholder={t('e.g. Morning Shift')}
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('Start Time')}</label>
                                <input
                                    type="time"
                                    value={formStartTime}
                                    onChange={(e) => setFormStartTime(e.target.value)}
                                    required
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('End Time')}</label>
                                <input
                                    type="time"
                                    value={formEndTime}
                                    onChange={(e) => setFormEndTime(e.target.value)}
                                    required
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded text-sm"
                            >
                                {submitting ? t('Saving...') : (editingSlot ? t('Update') : t('Create'))}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded text-sm"
                            >
                                {t('Cancel')}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {slots.length === 0 ? (
                <p className="text-gray-500">{t('No slots configured. Add one to get started.')}</p>
            ) : (
                <div className="space-y-2">
                    {slots.map((slot) => (
                        <div key={slot.slotId} className="flex items-center justify-between bg-white border rounded-lg p-4">
                            <div>
                                <div className="font-semibold">{slot.name}</div>
                                <div className="text-sm text-gray-500">{slot.displayText}</div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(slot)}
                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                >
                                    {t('Edit')}
                                </button>
                                <button
                                    onClick={() => handleDelete(slot.slotId)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    {t('Delete')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageSlots;
