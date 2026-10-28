"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

export type PartnerRecord = {
  id?: string | number;
  name: string;
  institution?: string | null;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
};

type PartnerViewMenuClientPageProps = {
  /** Rows fetched by the parent/server page. Pass [] until Supabase is connected. */
  partners?: PartnerRecord[];
  /** Connect these callbacks to Supabase update/delete functions when ready. */
  onEdit?: (partner: PartnerRecord) => void;
  onDelete?: (partner: PartnerRecord) => void;
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[15px] w-[15px] shrink-0 fill-none stroke-current"
      style={{ strokeWidth: 2, strokeLinecap: "round" }}
    >
      <circle cx="10.8" cy="10.8" r="6.4" />
      <path d="m15.5 15.5 4.1 4.1" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[14px] w-[14px] fill-none stroke-current"
      style={{ strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}
    >
      <path d="m14.2 5.1 4.7 4.7M4.5 19.5l4.2-.9L19.1 8.2a2.1 2.1 0 0 0-3-3L5.7 15.6l-1.2 3.9Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[14px] w-[14px] fill-none stroke-current"
      style={{ strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" }}
    >
      <path d="M4.5 7h15M9 7V4.8h6V7m-8.5 0 .8 12h9.4l.8-12M10 10.5v5.4m4-5.4v5.4" />
    </svg>
  );
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  return words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function samePartner(a: PartnerRecord, b: PartnerRecord) {
  if (a.id !== undefined && a.id !== null && b.id !== undefined && b.id !== null) {
    return a.id === b.id;
  }
  return a === b;
}

const actionButtonStyle: React.CSSProperties = {
  padding: 0,
  fontSize: 11,
  lineHeight: 1,
  border: 0,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  marginTop: 5,
  padding: "9px 10px",
  fontSize: 13,
  color: "#273751",
  background: "#fff",
  border: "1px solid #dfe7f1",
  borderRadius: 6,
  outlineOffset: 2,
  boxSizing: "border-box",
};

export default function PartnerViewMenuClientPage({
  partners = [],
  onEdit,
  onDelete,
}: PartnerViewMenuClientPageProps) {
  const [displayPartners, setDisplayPartners] = useState<PartnerRecord[]>(partners);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPartner, setEditingPartner] = useState<PartnerRecord | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<PartnerRecord | null>(null);
  const [editForm, setEditForm] = useState<PartnerRecord | null>(null);

  useEffect(() => {
    setDisplayPartners(partners);
  }, [partners]);

  const filteredPartners = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();
    if (!query) return displayPartners;

    return displayPartners.filter((partner) =>
      [partner.name, partner.institution, partner.jobTitle, partner.email, partner.phone]
        .some((value) => (value ?? "").toLocaleLowerCase().includes(query)),
    );
  }, [displayPartners, searchTerm]);

  function openEdit(partner: PartnerRecord) {
    setEditingPartner(partner);
    setEditForm({ ...partner });
  }

  function closeEdit() {
    setEditingPartner(null);
    setEditForm(null);
  }

  function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingPartner || !editForm) return;

    setDisplayPartners((current) =>
      current.map((partner) =>
        samePartner(partner, editingPartner) ? { ...editForm } : partner,
      ),
    );
    onEdit?.(editForm);
    closeEdit();
  }

  function confirmDelete() {
    if (!deletingPartner) return;
    setDisplayPartners((current) =>
      current.filter((partner) => !samePartner(partner, deletingPartner)),
    );
    onDelete?.(deletingPartner);
    setDeletingPartner(null);
  }

  return (
    <main className="mx-auto mt-3 mb-12 box-border w-[85.3vw] max-w-[1400px] text-[11px] text-[#182238] max-[640px]:mx-4 max-[640px]:w-[calc(100%-2rem)]">
      <header className="mb-6">
        <h1 className="m-0 text-[25px] font-bold leading-tight tracking-[-0.75px] text-[#151d30]">
          Partner Data
        </h1>
        <p className="mt-[5px] mb-0 text-[11px] leading-relaxed text-[#73829b]">
          View, manage, and edit your saved business contacts.
        </p>
      </header>

      <label className="mb-4 flex h-[36px] w-full items-center gap-2 rounded-[7px] border border-[#dfe7f1] bg-white px-[11px] text-[#93a3ba] transition focus-within:border-[#9eb6d6] focus-within:shadow-[0_0_0_3px_rgba(63,111,170,0.08)]">
        <SearchIcon />
        <span className="sr-only">Search by name or company</span>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search by name or company..."
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-[11px] text-[#26354d] outline-none placeholder:text-[#91a2bc]"
          style={{ padding: 0, fontSize: 11, border: 0, boxShadow: "none" }}
        />
      </label>

      <section
        aria-label="Partner contacts"
        className="w-full overflow-hidden rounded-[11px] border border-[#dfe7f1] bg-white"
      >
        <div className="w-full overflow-x-auto">
          <table
            className="w-full min-w-[820px] text-left text-[11px]"
            style={{ borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed" }}
          >
            <thead>
              <tr className="bg-[#f8fafc] text-[#64758f]">
                <th scope="col" className="h-[31px] w-[17%] border-b border-[#e2e9f2] px-[18px] text-[8.5px] font-bold tracking-[0.12px]">NAMA</th>
                <th scope="col" className="h-[31px] w-[20%] border-b border-[#e2e9f2] px-[18px] text-[8.5px] font-bold tracking-[0.12px]">INSTITUTION</th>
                <th scope="col" className="h-[31px] w-[18.5%] border-b border-[#e2e9f2] px-[18px] text-[8.5px] font-bold tracking-[0.12px]">JOB TITLE</th>
                <th scope="col" className="h-[31px] w-[19%] border-b border-[#e2e9f2] px-[18px] text-[8.5px] font-bold tracking-[0.12px]">EMAIL</th>
                <th scope="col" className="h-[31px] w-[16.5%] border-b border-[#e2e9f2] px-[18px] text-[8.5px] font-bold tracking-[0.12px]">PHONE</th>
                <th scope="col" className="h-[31px] w-[9%] border-b border-[#e2e9f2] px-[10px] text-center text-[8.5px] font-bold tracking-[0.12px]">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner, index) => {
                const avatarColor = index % 3 === 1
                  ? "bg-[#dff2ff] text-[#0872b7]"
                  : index % 3 === 2
                    ? "bg-[#f0f4f8] text-[#596b83]"
                    : "bg-[#e8edf4] text-[#53647c]";

                return (
                  <tr key={partner.id ?? `${partner.name}-${index}`} className="group">
                    <td className="h-[53px] border-b border-[#e8edf4] px-[18px] align-middle text-[#273751] group-last:border-b-0">
                      <div className="flex min-w-0 items-center gap-[9px]">
                        <span aria-hidden="true" className={`inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${avatarColor}`}>
                          {getInitials(partner.name)}
                        </span>
                        <span title={partner.name} className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold text-[#1c2940]">
                          {partner.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="h-[53px] border-b border-[#e8edf4] px-[18px] align-middle text-[#273751] group-last:border-b-0">{partner.institution || "—"}</td>
                    <td className="h-[53px] border-b border-[#e8edf4] px-[18px] align-middle text-[#4d5d76] group-last:border-b-0">{partner.jobTitle || "—"}</td>
                    <td className="h-[53px] border-b border-[#e8edf4] px-[18px] align-middle text-[#4d5d76] group-last:border-b-0">{partner.email || "—"}</td>
                    <td className="h-[53px] border-b border-[#e8edf4] px-[18px] align-middle text-[#4d5d76] group-last:border-b-0">{partner.phone || "—"}</td>
                    <td className="h-[53px] border-b border-[#e8edf4] px-[10px] align-middle group-last:border-b-0">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          aria-label={`Edit ${partner.name}`}
                          title="Edit partner"
                          onClick={() => openEdit(partner)}
                          className="inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[6px] bg-[#f0f4f8] text-[#43546b] hover:bg-[#e2eaf3]"
                          style={actionButtonStyle}
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${partner.name}`}
                          title="Delete partner"
                          onClick={() => setDeletingPartner(partner)}
                          className="inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-[6px] bg-[#ffe6e6] text-[#fa2828] hover:bg-[#ffd4d4]"
                          style={actionButtonStyle}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredPartners.length === 0 && (
                <tr>
                  <td colSpan={6} className="h-[70px] border-b-0 px-[18px] text-center text-[11px] text-[#8390a5]">
                    {searchTerm.trim()
                      ? "No partners match your search."
                      : "No partner records yet. Supabase records will appear here when connected."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editingPartner && editForm && (
        <div
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) closeEdit(); }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(17,29,49,0.34)] p-[22px] backdrop-blur-[2px]"
        >
          <section role="dialog" aria-modal="true" aria-labelledby="edit-partner-title" className="max-h-[min(90vh,760px)] w-full max-w-[480px] overflow-y-auto rounded-xl border border-[#e1e8f1] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-partner-title" className="m-0 text-lg font-bold text-[#182238]">Edit partner</h2>
                <p className="mt-1 mb-0 text-xs text-[#73829b]">Update the displayed contact details.</p>
              </div>
              <button type="button" onClick={closeEdit} aria-label="Close edit dialog" className="rounded-md text-xl leading-none text-[#64758f] hover:bg-[#f0f4f8]" style={{ ...actionButtonStyle, padding: 4 }}>×</button>
            </div>

            <form onSubmit={saveEdit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="mb-0 grid gap-1 text-xs font-medium text-[#43546b] sm:col-span-2">
                Name
                <input required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} style={fieldStyle} />
              </label>
              <label className="mb-0 grid gap-1 text-xs font-medium text-[#43546b] sm:col-span-2">
                Institution
                <input value={editForm.institution ?? ""} onChange={(event) => setEditForm({ ...editForm, institution: event.target.value })} style={fieldStyle} />
              </label>
              <label className="mb-0 grid gap-1 text-xs font-medium text-[#43546b]">
                Job title
                <input value={editForm.jobTitle ?? ""} onChange={(event) => setEditForm({ ...editForm, jobTitle: event.target.value })} style={fieldStyle} />
              </label>
              <label className="mb-0 grid gap-1 text-xs font-medium text-[#43546b]">
                Email
                <input type="email" value={editForm.email ?? ""} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} style={fieldStyle} />
              </label>
              <label className="mb-0 grid gap-1 text-xs font-medium text-[#43546b] sm:col-span-2">
                Phone
                <input value={editForm.phone ?? ""} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} style={fieldStyle} />
              </label>

              <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={closeEdit} className="rounded-md border border-[#dfe7f1] bg-white px-4 py-2 text-xs font-semibold text-[#43546b] hover:bg-[#f8fafc]" style={{ padding: "8px 16px", fontSize: 12 }}>Cancel</button>
                <button type="submit" className="rounded-md bg-[#263c59] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1b2e47]" style={{ padding: "8px 16px", fontSize: 12 }}>Save changes</button>
              </div>
            </form>
            {!onEdit && <p className="mt-4 mb-0 text-[11px] leading-relaxed text-[#8390a5]">Preview mode: changes update this page only until an update handler is connected.</p>}
          </section>
        </div>
      )}

      {deletingPartner && (
        <div
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setDeletingPartner(null); }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(17,29,49,0.34)] p-[22px] backdrop-blur-[2px]"
        >
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-partner-title" className="w-full max-w-[380px] rounded-xl border border-[#e1e8f1] bg-white p-6 shadow-2xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#ffe6e6] text-[#fa2828]"><DeleteIcon /></div>
            <h2 id="delete-partner-title" className="m-0 text-lg font-bold text-[#182238]">Delete partner?</h2>
            <p className="mt-2 mb-0 text-sm leading-relaxed text-[#64758f]">Remove <strong className="text-[#273751]">{deletingPartner.name}</strong> from this page?</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeletingPartner(null)} className="rounded-md border border-[#dfe7f1] bg-white px-4 py-2 text-xs font-semibold text-[#43546b] hover:bg-[#f8fafc]" style={{ padding: "8px 16px", fontSize: 12 }}>Cancel</button>
              <button type="button" onClick={confirmDelete} className="rounded-md bg-[#e12d39] px-4 py-2 text-xs font-semibold text-white hover:bg-[#c61f2b]" style={{ padding: "8px 16px", fontSize: 12 }}>Delete</button>
            </div>
            {!onDelete && <p className="mt-4 mb-0 text-[11px] leading-relaxed text-[#8390a5]">Preview mode: this does not delete the Supabase record.</p>}
          </section>
        </div>
      )}
    </main>
  );
}