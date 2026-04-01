import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
        <p className="text-lg text-gray-600 mb-2">Página não encontrada</p>
        <p className="text-sm text-gray-400 mb-6">
          A página que você procura não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
