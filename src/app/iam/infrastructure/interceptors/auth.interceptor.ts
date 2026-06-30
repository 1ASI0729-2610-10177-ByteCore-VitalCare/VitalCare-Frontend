import { HttpInterceptorFn } from '@angular/common/http';

const SESSION_STORAGE_KEY = 'vital-care-user';

function readToken(): string | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const user = JSON.parse(raw) as { token?: string };
    return user.token ?? null;
  } catch {
    return null;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // No adjuntar token a los endpoints de autenticación ni a los assets de i18n.
  if (req.url.includes('/api/v1/authentication') || req.url.includes('/i18n/')) {
    return next(req);
  }

  const token = readToken();
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};
