import { useState } from 'react';
import { Globe2, Plus, Trash2 } from 'lucide-react';
import { byCountry } from '../lib/branches';
import { IconButton, ListEditor, TextInput } from './form';

const MAX_BRANCHES = 30;
const COUNTRY_SUGGESTIONS = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'South Sudan', 'Ethiopia', 'Somalia', 'DR Congo', 'Zambia', 'Malawi', 'Nigeria', 'Ghana', 'South Africa'];

// Branches grouped by country: rename or remove a country, add branches to it, or add a new country.
export default function BranchesEditor({ branches, onChange }) {
  const groups = byCountry(branches);
  const [newCountry, setNewCountry] = useState('');
  const [error, setError] = useState(null);
  const full = branches.length >= MAX_BRANCHES;

  // Rebuild the flat list from the groups, keeping each country's branches together.
  const replaceGroup = (index, nextBranches) => onChange(groups.flatMap((g, i) => (i === index ? nextBranches : g.branches)));
  const renameCountry = (index, country) => replaceGroup(index, groups[index].branches.map((b) => ({ ...b, country })));

  const addCountry = (e) => {
    e.preventDefault();
    const name = newCountry.trim();
    if (!name) return setError('Type the country’s name first');
    const existing = groups.findIndex((g) => g.country.toLowerCase() === name.toLowerCase());
    const blank = { city: '', country: existing >= 0 ? groups[existing].country : name, phone: '', note: '' };
    if (existing >= 0) replaceGroup(existing, [...groups[existing].branches, blank]);
    else onChange([...branches, blank]);
    setNewCountry('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {groups.map((g, i) => (
        <div key={i} className="rounded-2xl bg-white/70 p-3 ring-1 ring-espresso/[0.08] sm:p-4">
          <div className="mb-3 flex items-end gap-2">
            <span className="mb-2.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-espresso text-honey">
              <Globe2 className="h-4 w-4" />
            </span>
            <TextInput
              label="Country"
              className="min-w-0 flex-1"
              value={g.country}
              onChange={(e) => renameCountry(i, e.target.value)}
              maxLength={40}
              list="branch-countries"
              placeholder="Country name"
            />
            <span className="mb-2.5">
              <IconButton label={`Remove ${g.country || 'this country'} and its branches`} danger onClick={() => replaceGroup(i, [])}>
                <Trash2 className="h-3.5 w-3.5" />
              </IconButton>
            </span>
          </div>
          <ListEditor
            items={g.branches}
            onChange={(next) => replaceGroup(i, next)}
            blank={{ city: '', country: g.country, phone: '', note: '' }}
            addLabel={`Add branch in ${g.country || 'this country'}`}
            max={full ? g.branches.length : MAX_BRANCHES}
            render={(b, update) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <TextInput label="Town" value={b.city} onChange={(e) => update({ city: e.target.value })} maxLength={30} placeholder="e.g. Kampala" />
                <TextInput label="Phone" value={b.phone} onChange={(e) => update({ phone: e.target.value })} maxLength={24} inputMode="tel" placeholder="0700 000 000" />
                <TextInput label="Badge" optional value={b.note} onChange={(e) => update({ note: e.target.value })} maxLength={30} placeholder="New branch" />
              </div>
            )}
          />
        </div>
      ))}

      {!full && (
        <form onSubmit={addCountry} className="rounded-2xl border border-dashed border-espresso/20 p-3 sm:p-4">
          <p className="text-sm font-semibold">Opening in a new country?</p>
          <p className="mb-3 text-xs text-espresso/55">Add the country, then fill in its first branch.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="field min-w-0 flex-1"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              list="branch-countries"
              maxLength={40}
              placeholder="e.g. Uganda"
              aria-label="New country"
            />
            <button className="btn btn-primary shrink-0">
              <Plus className="h-4 w-4" /> Add country
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        </form>
      )}
      {full && <p className="text-xs text-espresso/50">That’s the maximum of {MAX_BRANCHES} branches.</p>}

      <datalist id="branch-countries">
        {COUNTRY_SUGGESTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}
