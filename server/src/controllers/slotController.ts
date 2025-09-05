import { Request, Response } from 'express';
import Slot from '../models/slot';
import { ISlotBody, ISlotWithDisplay } from '../types';

export const getAllSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const slots = await Slot.getAll();
        const slotsWithDisplay: ISlotWithDisplay[] = slots.map(slot => ({
            ...slot,
            displayText: Slot.getDisplayText(slot)
        }));
        res.json({ success: true, data: slotsWithDisplay });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const createSlot = async (req: Request<{}, {}, ISlotBody>, res: Response): Promise<void> => {
    try {
        const { name, startTime, endTime } = req.body;

        if (!name || !startTime || !endTime) {
            res.status(400).json({ success: false, error: 'Name, startTime, and endTime are required' });
            return;
        }

        const slot = new Slot(null, name, startTime, endTime);
        const savedSlot = await slot.save();

        res.status(201).json({
            success: true,
            data: { ...savedSlot, displayText: Slot.getDisplayText(savedSlot) },
            message: 'Slot created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const updateSlot = async (req: Request<{ slotId: string }, {}, Partial<ISlotBody>>, res: Response): Promise<void> => {
    try {
        const { slotId } = req.params;
        const { name, startTime, endTime } = req.body;

        const updates: Partial<ISlotBody> = {};
        if (name) updates.name = name;
        if (startTime) updates.startTime = startTime;
        if (endTime) updates.endTime = endTime;

        const updatedSlot = await Slot.update(slotId, updates);
        res.json({
            success: true,
            data: { ...updatedSlot, displayText: Slot.getDisplayText(updatedSlot) },
            message: 'Slot updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const deleteSlot = async (req: Request<{ slotId: string }>, res: Response): Promise<void> => {
    try {
        const { slotId } = req.params;

        const isReferenced = await Slot.isReferenced(slotId);
        if (isReferenced) {
            res.status(400).json({
                success: false,
                error: 'Cannot delete slot that is referenced by existing applications'
            });
            return;
        }

        await Slot.delete(slotId);
        res.json({ success: true, message: 'Slot deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

export const seedSlots = async (req: Request, res: Response): Promise<void> => {
    try {
        const existingSlots = await Slot.getAll();
        if (existingSlots.length > 0) {
            res.json({ success: true, message: 'Slots already exist', data: existingSlots });
            return;
        }

        const slot1 = new Slot(null, 'Morning Shift', '11:00', '14:00');
        const slot2 = new Slot(null, 'Afternoon Shift', '14:00', '17:00');

        await slot1.save();
        await slot2.save();

        res.status(201).json({
            success: true,
            message: 'Default slots created',
            data: [slot1, slot2]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};
