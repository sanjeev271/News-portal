import { useEffect, useState } from "react";
import API from "../../api/axios";
import LanguageField, { LanguageBadge } from "../../components/admin/LanguageField";
import { formatClockTime } from "../../utils/formatTime";

export default function AdminLiveEvents() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", location: "", status: "scheduled", locale: "ne" });
  const [updateForm, setUpdateForm] = useState({
    slug: "",
    title: "",
    text: "",
    locale: "ne",
    isBreaking: false,
    images: [],
    imageCaption: "",
  });
  const [eventUpdates, setEventUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const load = () =>
    API.get("/live-events")
      .then((r) => setEvents(r.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const loadEventUpdates = (slug) => {
    if (!slug) {
      setEventUpdates([]);
      return Promise.resolve([]);
    }
    setLoadingUpdates(true);
    return API.get(`/live-events/${slug}/updates`, { params: { limit: 50 } })
      .then((res) => {
        const updates = res.data.updates || res.data || [];
        setEventUpdates(updates);
        return updates;
      })
      .catch(() => {
        setEventUpdates([]);
        return [];
      })
      .finally(() => setLoadingUpdates(false));
  };

  useEffect(() => {
    loadEventUpdates(updateForm.slug);
  }, [updateForm.slug]);

  const create = async (e) => {
    e.preventDefault();
    await API.post("/live-events", form);
    setForm({ title: "", description: "", location: "", status: "scheduled", locale: form.locale });
    load();
  };

  const setStatus = async (id, status) => {
    await API.put(`/live-events/${id}`, { status });
    load();
  };

  const onImagePick = (e) => {
    const files = Array.from(e.target.files || []);
    setUpdateForm((prev) => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 10),
    }));
    e.target.value = "";
  };

  const removeImage = (index) => {
    setUpdateForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const postUpdate = async (e) => {
    e.preventDefault();
    if (!updateForm.slug || (!updateForm.text && !updateForm.title && !updateForm.images.length)) return;

    setPosting(true);
    try {
      const data = new FormData();
      data.append("text", updateForm.text);
      data.append("locale", updateForm.locale);
      if (updateForm.title) data.append("title", updateForm.title);
      data.append("isBreaking", String(updateForm.isBreaking));
      if (updateForm.imageCaption) data.append("imageCaption", updateForm.imageCaption);
      updateForm.images.forEach((file) => data.append("images", file));

      await API.post(`/live-events/${updateForm.slug}/updates`, data);
      setUpdateForm({
        slug: updateForm.slug,
        title: "",
        text: "",
        locale: updateForm.locale,
        isBreaking: false,
        images: [],
        imageCaption: "",
      });
      await loadEventUpdates(updateForm.slug);
      load();
    } finally {
      setPosting(false);
    }
  };

  const deleteUpdate = async (updateId) => {
    if (!updateForm.slug || !window.confirm("Delete this live update?")) return;
    setDeletingId(updateId);
    try {
      await API.delete(`/live-events/${updateForm.slug}/updates/${updateId}`);
      setEventUpdates((prev) => prev.filter((u) => u._id !== updateId));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold dark:text-white">Live Events</h1>
      <p className="max-w-xl text-sm text-slate-500">
        Create events and post updates in Nepali or English. Readers see content matching their selected site language.
      </p>

      <form onSubmit={create} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="font-bold dark:text-white">Create Live Event</h2>
        <LanguageField
          label="Event language"
          value={form.locale}
          onChange={(e) => setForm({ ...form, locale: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder={form.locale === "ne" ? "कार्यक्रम शीर्षक" : "Event title"}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder={form.locale === "ne" ? "विवरण" : "Description"}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder={form.locale === "ne" ? "स्थान" : "Location"}
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <button type="submit" className="btn-primary w-fit px-4 py-2">Create Live Event</button>
      </form>

      <form onSubmit={postUpdate} className="grid max-w-xl gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
        <h2 className="font-bold dark:text-white">Post Live Update</h2>
        <LanguageField
          label="Update language"
          value={updateForm.locale}
          onChange={(e) => setUpdateForm({ ...updateForm, locale: e.target.value })}
        />
        <select
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          value={updateForm.slug}
          onChange={(e) => setUpdateForm({ ...updateForm, slug: e.target.value })}
          required
        >
          <option value="">Select event</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev.slug}>
              [{ev.locale === "en" ? "EN" : "NE"}] {ev.title}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder={updateForm.locale === "ne" ? "शीर्षक (वैकल्पिक)" : "Headline (optional)"}
          value={updateForm.title}
          onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
        />
        <textarea
          className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder={updateForm.locale === "ne" ? "अपडेट पाठ" : "Update text"}
          value={updateForm.text}
          onChange={(e) => setUpdateForm({ ...updateForm, text: e.target.value })}
          rows={4}
        />
        <div>
          <label className="mb-2 block text-sm font-semibold dark:text-white">Add images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onImagePick}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-bbc-red file:px-3 file:py-2 file:text-sm file:font-bold file:text-white"
          />
          {updateForm.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {updateForm.images.map((file, i) => (
                <div key={`${file.name}-${i}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-20 w-20 rounded-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            placeholder={updateForm.locale === "ne" ? "तस्बिर क्याप्सन" : "Image caption (optional)"}
            value={updateForm.imageCaption}
            onChange={(e) => setUpdateForm({ ...updateForm, imageCaption: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={updateForm.isBreaking}
            onChange={(e) => setUpdateForm({ ...updateForm, isBreaking: e.target.checked })}
          />
          Breaking update
        </label>
        <button type="submit" disabled={posting} className="btn-primary w-fit px-4 py-2">
          {posting ? "Publishing…" : "Publish Update"}
        </button>
      </form>

      {updateForm.slug && (
        <div className="max-w-xl space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h2 className="font-bold dark:text-white">Published Updates</h2>
          {loadingUpdates ? (
            <p className="text-sm text-slate-500">Loading updates…</p>
          ) : !eventUpdates.length ? (
            <p className="text-sm text-slate-500">No updates for this event yet.</p>
          ) : (
            <ul className="space-y-2">
              {eventUpdates.map((update) => (
                <li
                  key={update._id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-700"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <LanguageBadge locale={update.locale || "ne"} />
                      <span className="text-xs text-slate-500">{formatClockTime(update.createdAt)}</span>
                      {update.isBreaking && (
                        <span className="rounded bg-bbc-red px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          Breaking
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {update.title || update.text?.slice(0, 120) || "(No text)"}
                    </p>
                    {update.title && update.text && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{update.text}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteUpdate(update._id)}
                    disabled={deletingId === update._id}
                    className="shrink-0 rounded border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    {deletingId === update._id ? "Deleting…" : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="space-y-3">
        {events.map((ev) => (
          <div key={ev._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <LanguageBadge locale={ev.locale || "ne"} />
                <div className="font-bold dark:text-white">{ev.title}</div>
              </div>
              <div className="text-sm text-slate-500">/{ev.slug} · {ev.status}</div>
            </div>
            <div className="flex gap-2">
              {ev.status !== "live" && (
                <button type="button" onClick={() => setStatus(ev._id, "live")} className="rounded bg-bbc-red px-3 py-1 text-sm font-bold text-white">
                  Go Live
                </button>
              )}
              {ev.status === "live" && (
                <button type="button" onClick={() => setStatus(ev._id, "ended")} className="rounded bg-slate-700 px-3 py-1 text-sm font-bold text-white">
                  End
                </button>
              )}
              <a href={`/live-event/${ev.slug}`} target="_blank" rel="noreferrer" className="rounded border px-3 py-1 text-sm font-semibold">
                View
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
