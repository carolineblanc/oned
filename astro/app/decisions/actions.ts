'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addDecision(formData: FormData): Promise<void> {
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  if (!description) return;

  const direction = (formData.get('direction') as string | null) || 'stretch';
  const context   = (formData.get('context')   as string | null)?.trim() || null;
  const houseStr  = formData.get('house') as string | null;
  const house     = houseStr ? parseInt(houseStr, 10) : null;
  const date      = new Date().toISOString().slice(0, 10);

  db.prepare(
    'INSERT INTO decisions (description, direction, context, house, date) VALUES (?, ?, ?, ?, ?)',
  ).run(description, direction, context, house, date);

  revalidatePath('/decisions');
}

export async function removeDecision(id: number): Promise<void> {
  db.prepare('DELETE FROM decisions WHERE id = ?').run(id);
  revalidatePath('/decisions');
}
