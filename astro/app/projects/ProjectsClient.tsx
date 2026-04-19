'use client';

import { useState, useTransition } from 'react';
import { HOUSES } from '@/lib/houses-data';
import { addProject, setProjectState, removeProject } from './actions';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  intention: string | null;
  domain: string | null;
  house: number | null;
  state: string | null;
  value_model: string | null;
  transitNote: string | null;
  houseVerb: string | null;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<string, { label: string; color: string }> = {
  incubate: { label: 'Incubate', color: '#9B8EC4' },
  build:    { label: 'Build',    color: '#C4956A' },
  share:    { label: 'Share',    color: '#6BA89E' },
  scale:    { label: 'Scale',    color: '#D4A853' },
  pause:    { label: 'Pause',    color: '#7A8B99' },
};

const STATES = ['incubate', 'build', 'share', 'scale', 'pause'] as const;

const VALUE_MODEL_LABELS: Record<string, string> = {
  retainer:   'Retainer / Advisory',
  membership: 'Membership / Salon',
  content:    'Paid Intellectual Content',
  access:     'Private Curated Access',
};

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls = [
  'w-full bg-transparent border border-border rounded-sm px-3 py-2 text-sm text-primary',
  'placeholder:text-muted/50 focus:outline-none focus:border-accent/60 transition-colors',
].join(' ');

const selectCls = [
  'w-full bg-[#13110e] border border-border rounded-sm px-3 py-2 text-sm text-primary',
  'focus:outline-none focus:border-accent/60 transition-colors',
].join(' ');

// ─── Add project form ─────────────────────────────────────────────────────────

function AddProjectForm({ onClose }: { onClose: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await addProject(fd);
      setFormKey((k) => k + 1);
    });
  }

  return (
    <div className="bg-card border border-border rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-sans text-muted uppercase tracking-widest">New project</p>
        <button onClick={onClose} className="text-muted/50 hover:text-muted text-sm transition-colors">✕</button>
      </div>

      <form key={formKey} onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted font-sans uppercase tracking-widest">Name *</label>
            <input name="name" type="text" required placeholder="Project name" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted font-sans uppercase tracking-widest">Intention</label>
            <input name="intention" type="text" placeholder="What this is for" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted font-sans uppercase tracking-widest">Energetic domain</label>
            <input name="domain" type="text" placeholder="e.g. luxury, tech, creativity" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted font-sans uppercase tracking-widest">House</label>
            <select name="house" className={selectCls}>
              <option value="">— none —</option>
              {HOUSES.map((h) => (
                <option key={h.n} value={h.n}>H{h.n} · {h.verb}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted font-sans uppercase tracking-widest">State</label>
            <select name="state" className={selectCls} defaultValue="incubate">
              {STATES.map((s) => (
                <option key={s} value={s}>{STATE_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted font-sans uppercase tracking-widest">Value model</label>
            <select name="value_model" className={selectCls}>
              <option value="">— none —</option>
              {Object.entries(VALUE_MODEL_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-muted font-sans hover:text-body transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-xs font-sans rounded-sm border transition-colors disabled:opacity-50"
            style={{ color: '#C4956A', borderColor: '#C4956A55' }}
          >
            {isPending ? 'Adding…' : 'Add project'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const [isPending, startTransition] = useTransition();
  const currentState  = project.state ?? 'incubate';
  const stateConfig   = STATE_CONFIG[currentState] ?? STATE_CONFIG.incubate;
  const vmLabel       = project.value_model ? VALUE_MODEL_LABELS[project.value_model] : null;

  function handleState(s: string) {
    startTransition(() => setProjectState(project.id, s));
  }

  function handleDelete() {
    if (!confirm(`Delete "${project.name}"?`)) return;
    startTransition(() => removeProject(project.id));
  }

  return (
    <div
      className={['bg-card border rounded-sm p-5 space-y-4 transition-opacity', isPending ? 'opacity-40' : ''].join(' ')}
      style={{ borderColor: `${stateConfig.color}30` }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-sans px-2 py-0.5 rounded-sm border tracking-wide"
          style={{ color: stateConfig.color, borderColor: `${stateConfig.color}44` }}
        >
          {stateConfig.label}
        </span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-muted/40 hover:text-[#B05A5A] text-xs font-sans transition-colors"
        >
          × delete
        </button>
      </div>

      {/* Name + intention */}
      <div className="space-y-1">
        <h3 className="font-display italic text-lg leading-tight text-primary">{project.name}</h3>
        {project.intention && (
          <p className="text-body text-sm">{project.intention}</p>
        )}
      </div>

      {/* Tags */}
      {(project.house || project.domain || vmLabel) && (
        <div className="flex flex-wrap gap-1.5">
          {project.house && project.houseVerb && (
            <span className="text-[10px] font-sans px-2 py-0.5 border border-border rounded-sm text-muted">
              H{project.house} · {project.houseVerb}
            </span>
          )}
          {project.domain && (
            <span className="text-[10px] font-sans px-2 py-0.5 border border-border rounded-sm text-muted">
              {project.domain}
            </span>
          )}
          {vmLabel && (
            <span className="text-[10px] font-sans px-2 py-0.5 border border-border rounded-sm text-muted italic">
              {vmLabel}
            </span>
          )}
        </div>
      )}

      {/* Transit note */}
      {project.transitNote && (
        <p className="text-[11px] font-sans leading-snug" style={{ color: '#a09580aa' }}>
          <span className="text-muted mr-1">↝</span>{project.transitNote}
        </p>
      )}

      {/* State switcher */}
      <div className="flex flex-wrap gap-1 pt-0.5">
        {STATES.map((s) => {
          const sc       = STATE_CONFIG[s];
          const isActive = currentState === s;
          return (
            <button
              key={s}
              onClick={() => handleState(s)}
              disabled={isPending}
              className="text-[10px] font-sans px-2.5 py-1 rounded-sm border transition-colors disabled:cursor-not-allowed"
              style={{
                color:           isActive ? sc.color : '#6a5f4f',
                borderColor:     isActive ? `${sc.color}55` : '#211e18',
                backgroundColor: isActive ? `${sc.color}12` : 'transparent',
              }}
            >
              {sc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ProjectsClient({ projects }: { projects: Project[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-3">
      {showForm ? (
        <AddProjectForm onClose={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full bg-card border border-border/60 hover:border-accent/30 rounded-sm px-5 py-3.5 text-left transition-colors group"
        >
          <span className="text-muted text-sm font-sans group-hover:text-body transition-colors">
            + Add project
          </span>
        </button>
      )}

      {projects.length === 0 && !showForm && (
        <p className="text-muted text-sm italic px-1 pt-1">No projects yet.</p>
      )}

      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
