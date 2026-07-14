import React from 'react';
import { isRouteErrorResponse, useRouteError, Link } from 'react-router-dom';

const RouteError: React.FC = () => {
  const error = useRouteError();

  let title = 'Terjadi kesalahan pada aplikasi';
  let message = 'Halaman gagal dimuat. Silakan muat ulang atau kembali ke halaman login.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message =
      typeof error.data === 'string'
        ? error.data
        : 'Request tidak dapat diproses oleh router.';
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{message}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-10 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
          >
            Muat Ulang
          </button>
          <Link
            to="/login"
            className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold"
          >
            Ke Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RouteError;
