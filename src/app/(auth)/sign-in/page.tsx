import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900">Giriş Yap</h1>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
        <p className="text-sm text-gray-600">
          Bu uygulama şu anda authentication olmadan çalışmaktadır.
        </p>
        <div className="flex justify-end">
          <Link
            href="/dashboard"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Dashboard'a Git
          </Link>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Not: Authentication sistemi henüz aktif değil. Tüm sayfalara erişim serbesttir.
      </p>
    </div>
  );
}


