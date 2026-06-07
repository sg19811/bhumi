import Link from "next/link";

type Article = { slug: string; title: string; summary?: string | null; topic?: string | null; reading_minutes?: number | null };

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/legal/articles/${article.slug}`}
      className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
    >
      {article.topic && (
        <span className="mb-2 inline-block rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium capitalize text-green-800">
          {article.topic.replace(/_/g, " ")}
        </span>
      )}
      <h3 className="font-semibold leading-snug text-gray-900 group-hover:text-green-800">{article.title}</h3>
      {article.summary && <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">{article.summary}</p>}
      <p className="mt-3 text-xs text-gray-400">{article.reading_minutes ?? 5} min read · Read →</p>
    </Link>
  );
}
