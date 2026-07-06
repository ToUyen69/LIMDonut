if (typeof window !== 'undefined' && !customElements.get('model-viewer')) {
  import('@google/model-viewer').catch(err => console.error('Failed to load model-viewer', err));
}
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
