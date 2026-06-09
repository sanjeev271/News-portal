import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";
import ArticlePublishPreview from "../../components/ArticlePublishPreview";
import RichTextEditor from "../../components/RichTextEditor";
import { defaultFeaturedImage, normalizeContent, normalizeSummary } from "../../utils/articleFormat";
import { getImageUrl } from "../../utils/formatTime";

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");

  useEffect(() => {
    Promise.all([API.get("/categories"), API.get("/articles/admin/all")]).then(([catRes, artRes]) => {
      setCategories(catRes.data);
      const article = artRes.data.find((a) => a._id === id);
      if (article) {
        setForm({ ...article, category: article.category?._id || "" });
        if (article.featuredImage?.startsWith("http")) {
          setFeaturedImageUrl(article.featuredImage);
        }
      }
    });
  }, [id]);

  const categoryName = categories.find((c) => c._id === form?.category)?.name;

  const previewImage = useMemo(() => {
    if (featuredImage) return URL.createObjectURL(featuredImage);
    if (featuredImageUrl?.startsWith("http")) return featuredImageUrl;
    if (form?.featuredImage) return getImageUrl(form.featuredImage);
    if (form?.title) return defaultFeaturedImage(form.title);
    return null;
  }, [featuredImage, featuredImageUrl, form?.featuredImage, form?.title]);

  if (!form) return <p className="text-slate-400">Loading…</p>;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    const summary = normalizeSummary(form.title, form.summary, form.content);
    const content = normalizeContent(form.content, summary);

    const data = new FormData();
    data.append("title", form.title);
    data.append("summary", summary);
    data.append("content", content);
    data.append("category", form.category);
    data.append("status", form.status);
    data.append("mediaType", form.mediaType || "article");
    data.append("locale", form.locale || "en");
    data.append("isBreaking", form.isBreaking || false);
    data.append("seoTitle", form.seoTitle || form.title);
    data.append("seoDescription", form.seoDescription || summary.slice(0, 160));
    if (form.keywords) data.append("keywords", form.keywords);
    if (form.scheduledAt) data.append("scheduledAt", form.scheduledAt);
    if (!featuredImage && featuredImageUrl?.startsWith("http")) {
      data.append("featuredImageUrl", featuredImageUrl.trim());
    }
    if (featuredImage) data.append("featuredImage", featuredImage);

    await API.put(`/articles/${id}`, data);
    navigate("/admin/articles");
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold dark:text-white">Edit Article</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={save} className="max-w-2xl space-y-4">
          <input name="title" value={form.title} onChange={handleChange} required
            className="w-full border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          <textarea name="summary" value={form.summary || ""} onChange={handleChange} rows={2}
            className="w-full border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          <RichTextEditor value={form.content || ""} onChange={(html) => setForm((p) => ({ ...p, content: html }))} />
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select name="status" value={form.status} onChange={handleChange}
            className="w-full border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <label className="flex items-center gap-2 text-sm dark:text-slate-300">
            <input type="checkbox" name="isBreaking" checked={form.isBreaking || false} onChange={handleChange} />
            Breaking News
          </label>
          <div className="border border-slate-200 p-4 dark:border-slate-700">
            <p className="mb-2 text-sm font-bold dark:text-white">Featured Image</p>
            <input
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              placeholder="Image URL"
              className="mb-2 w-full border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
            <input type="file" accept="image/*" onChange={(e) => setFeaturedImage(e.target.files[0])} className="text-xs" />
          </div>
          <input type="datetime-local" name="scheduledAt"
            value={form.scheduledAt ? new Date(form.scheduledAt).toISOString().slice(0, 16) : ""}
            onChange={handleChange} className="w-full border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          <input name="seoTitle" value={form.seoTitle || ""} onChange={handleChange} placeholder="SEO Title"
            className="w-full border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          <input name="seoDescription" value={form.seoDescription || ""} onChange={handleChange} placeholder="SEO Description"
            className="w-full border px-3 py-2 dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
          <button type="submit" className="bg-bbc-red px-5 py-2 font-bold text-white">Save Changes</button>
        </form>

        <ArticlePublishPreview
          title={form.title}
          summary={normalizeSummary(form.title, form.summary, form.content)}
          categoryName={categoryName}
          imageUrl={previewImage}
          isBreaking={form.isBreaking}
        />
      </div>
    </div>
  );
}
