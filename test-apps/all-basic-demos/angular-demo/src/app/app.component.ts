import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment.development';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-demo';

  constructor() {
    // Environment variables demo
    console.log('Angular Environment Variables:', {
      production: environment.production,
      apiUrl: environment.apiUrl,
      apiKey: environment.apiKey,
      featureFlags: environment.featureFlags,
      version: environment.appVersion,
      environmentName: environment.environmentName,
      maxUploadSize: environment.maxUploadSize,
      stripePublicKey: environment.stripePublicKey,
      googleAnalyticsId: environment.googleAnalyticsId,
      sentryDsn: environment.sentryDsn
    });
  }
}
