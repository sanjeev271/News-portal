import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import RichTextEditor from "../components/RichTextEditor";
import ArticlePublishPreview from "../components/ArticlePublishPreview";
import RoleBadge from "../components/RoleBadge";
import {
  defaultFeaturedImage,
  normalizeContent,
  normalizeSummary,
} from "../utils/articleFormat";

export default function PublishNews() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addNotification } = useNotifications();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    category: "",
    status: "published",
    isBreaking: false,
    mediaType: "article",
    locale: "en",
    seoTitle: "",
    seoDescription: "",
    keywords: "",
    scheduledAt: "",
    featuredImageUrl: "",
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    API.get("/categories").then((res) => setCategories(res.data));
  }, []);

  if (!isAdmin) return <Navigate to="/" replace />;

  const categoryName = categories.find((c) => c._id === form.category)?.name;

  const previewImage = useMemo(() => {
    if (featuredImage) return URL.createObjectURL(featuredImage);
    if (form.featuredImageUrl?.startsWith("http")) return form.featuredImageUrl;
    if (form.title) return defaultFeaturedImage(form.title);
    return null;
  }, [featuredImage, form.featuredImageUrl, form.title]);

  const previewSummary = useMemo(
    () => normalizeSummary(form.title, form.summary, form.content),
    [form.title, form.summary, form.content]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const autoFillSeo = () => {
    const summary = normalizeSummary(form.title, form.summary, form.content);
    setForm((prev) => ({
      ...prev,
      summary: prev.summary || summary,
      seoTitle: prev.seoTitle || prev.title,
      seoDescription: prev.seoDescription || summary.slice(0, 160),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const summary = normalizeSummary(form.title, form.summary, form.content);
      const content = normalizeContent(form.content, summary);

      const payload = {
        title: form.title.trim(),
        summary,
        content,
        category: form.category,
        status: form.status,
        mediaType: form.mediaType,
        locale: form.locale,
        isBreaking: form.isBreaking,
        seoTitle: form.seoTitle || form.title,
        seoDescription: form.seoDescription || summary.slice(0, 160),
        keywords: form.keywords || undefined,
        scheduledAt: form.scheduledAt || undefined,
        featuredImageUrl: !featuredImage && form.featuredImageUrl?.startsWith("http")
          ? form.featuredImageUrl.trim()
          : undefined,
      };

      const hasFiles = featuredImage || video || gallery;
      let res;
      if (hasFiles) {
        const data = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== "") data.append(k, v);
        });
        if (featuredImage) data.append("featuredImage", featuredImage);
        if (video) data.append("video", video);
        if (gallery) Array.from(gallery).forEach((f) => data.append("gallery", f));
        res = await API.post("/articles", data);
      } else {
        res = await API.post("/articles", payload);
      }
      setSuccess(`"${res.data.title}" published — redirecting to homepage…`);
      addNotification({
        type: "article",
        icon: "✅",
        title: "Published",
        message: res.data.title,
        link: `/article/${res.data.slug}`,
      });
      setForm({
        title: "",
        summary: "",
        content: "",
        category: form.category,
        status: "published",
        isBreaking: false,
        mediaType: "article",
        locale: "en",
        seoTitle: "",
        seoDescription: "",
        keywords: "",
        scheduledAt: "",
        featuredImageUrl: "",
      });
      setFeaturedImage(null);
      setVideo(null);
      setGallery(null);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center gap-2">
        <h1 className="text-2xl font-extrabold dark:text-white">Publish News</h1>
        <RoleBadge role="admin" />
      </div>
      <p className="mb-6 text-sm text-slate-500">
        Articles are auto-formatted like seed data — featured image, summary, and HTML content.
      </p>

      {error && <div className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && (
        <div className="mb-4 border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}{" "}
          <Link to="/" className="font-bold text-bbc-red hover:underline">View homepage feed →</Link>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            onBlur={autoFillSeo}
            placeholder="Headline *"
            required
            className="w-full border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <textarea
            name="summary"
            value={form.summary}
            onChange={handleChange}
            placeholder="Summary (auto-generated from content if left empty)"
            rows={2}
            className="w-full border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm((p) => ({ ...p, content: html }))}
            placeholder="Full story — plain text is converted to paragraphs like seed articles"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">Category *</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              name="mediaType"
              value={form.mediaType}
              onChange={handleChange}
              className="border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="article">Article</option>
              <option value="video">Video News</option>
              <option value="gallery">Photo Gallery</option>
            </select>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="published">Publish Now</option>
              <option value="draft">Save Draft</option>
            </select>
            <select
              name="locale"
              value={form.locale}
              onChange={handleChange}
              className="border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-3 text-sm font-bold dark:text-white">Featured Image *</p>
            <p className="mb-3 text-xs text-slate-500">
              Upload a file, paste an image URL, or leave empty — a unique image is auto-assigned like seed data.
            </p>
            <input
              name="featuredImageUrl"
              value={form.featuredImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="mb-3 w-full border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFeaturedImage(e.target.files[0])}
              className="block w-full text-xs"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm dark:text-slate-300">
              Video file
              <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} className="mt-1 block w-full text-xs" />
            </label>
            <label className="text-sm dark:text-slate-300">
              Gallery images
              <input type="file" accept="image/*" multiple onChange={(e) => setGallery(e.target.files)} className="mt-1 block w-full text-xs" />
            </label>
          </div>

          <input
            type="datetime-local"
            name="scheduledAt"
            value={form.scheduledAt}
            onChange={handleChange}
            className="w-full border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <input
            name="seoTitle"
            value={form.seoTitle}
            onChange={handleChange}
            placeholder="SEO Title (defaults to headline)"
            className="w-full border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <input
            name="seoDescription"
            value={form.seoDescription}
            onChange={handleChange}
            placeholder="SEO Description (defaults to summary)"
            className="w-full border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          <input
            name="keywords"
            value={form.keywords}
            onChange={handleChange}
            placeholder="Keywords (comma separated)"
            className="w-full border px-4 py-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />

          <label className="flex items-center gap-2 text-sm dark:text-slate-300">
            <input type="checkbox" name="isBreaking" checked={form.isBreaking} onChange={handleChange} />
            Breaking News
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-bbc-red py-3.5 font-bold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Publishing…" : "Publish Article"}
          </button>
        </form>

        <div className="relative z-0 lg:sticky lg:top-6">
          <ArticlePublishPreview
            title={form.title}
            summary={previewSummary}
            categoryName={categoryName}
            imageUrl={previewImage}
            isBreaking={form.isBreaking}
          />
        </div>
      </div>
    </div>
  );
}
