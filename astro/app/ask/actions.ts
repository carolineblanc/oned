'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function clearMessages(): Promise<void> {
  db.prepare('DELETE FROM messages').run();
  revalidatePath('/ask');
}
