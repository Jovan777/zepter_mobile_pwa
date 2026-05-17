import { environment } from '../../environments/environment';

export function assetUrl(path: string | null | undefined): string {
  if (!path) {
    return '/assets/images/logos/zepter-logo.png';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${environment.assetsBaseUrl}${path}`;
}
