'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addProject(formData: FormData): Promise<void> {
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  if (!name) return;

  const intention   = (formData.get('intention')   as string | null)?.trim() || null;
  const domain      = (formData.get('domain')      as string | null)?.trim() || null;
  const houseStr    = formData.get('house')        as string | null;
  const house       = houseStr ? parseInt(houseStr) : null;
  const state       = (formData.get('state')       as string | null) || 'incubate';
  const value_model = (formData.get('value_model') as string | null) || null;

  db.prepare(
    'INSERT INTO projects (name, intention, domain, house, state, value_model) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(name, intention, domain, house, state, value_model);

  revalidatePath('/projects');
  revalidatePath('/value-flow');
}

export async function setProjectState(id: number, state: string): Promise<void> {
  db.prepare('UPDATE projects SET state = ? WHERE id = ?').run(state, id);
  revalidatePath('/projects');
}

export async function removeProject(id: number): Promise<void> {
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  revalidatePath('/projects');
  revalidatePath('/value-flow');
}
