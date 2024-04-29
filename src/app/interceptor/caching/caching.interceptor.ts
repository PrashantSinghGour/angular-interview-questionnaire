import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';
import { CacheResolverService } from './cache-resolver.service';
import { inject } from '@angular/core';
const TIME_TO_LEAVE = 100;

export const cachingInterceptor: HttpInterceptorFn = (req, next) => {
  let cacheResolverService = inject(CacheResolverService);
  let isUpdate: boolean = false;

  if (req.method !== 'GET') {
    cacheResolverService.cache.clear();
    return next(req);
  }

  const cachedResponse = cacheResolverService.get(req.url);

  if (cachedResponse) {
    return of(cachedResponse);
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cacheResolverService.set(req.url, event, TIME_TO_LEAVE);
      }
    }),
  );
};
