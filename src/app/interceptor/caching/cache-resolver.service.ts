import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheResolverService {
  constructor() {}

  public cache = new Map<String, [Date | null, HttpResponse<any>]>();

  set(key: string, value: HttpResponse<any>, timeToLeave: number | null = null) {
    if (timeToLeave) {
      const expiresIn = new Date();
      expiresIn.setSeconds(expiresIn.getSeconds() + timeToLeave);
      this.cache.set(key, [expiresIn, value]);
    } else {
      this.cache.set(key, [null, value]);
    }
  }

  get(key: string) {
    const tuple = this.cache.get(key);
    if (!tuple) return null;
    const expiresIn = tuple[0];
    const httpResponseValue = tuple[1];
    const now = new Date();
    if (expiresIn && expiresIn.getTime() < now.getTime()) {
      this.cache.delete(key);
      return null;
    }
    return httpResponseValue;
  }
}
