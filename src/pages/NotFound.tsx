import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold font-heading text-primary-500 mb-4">
          404
        </h1>
        <p className="text-lg md:text-xl text-foreground-600 mb-6">
          الصفحة التي تبحث عنها غير موجودة.
        </p>                              
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-background-50 rounded-md font-medium hover:bg-primary-600 transition-colors"
        >
          <i className="ri-home-line" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
