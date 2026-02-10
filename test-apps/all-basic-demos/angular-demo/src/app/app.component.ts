import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeyValuePipe } from '@angular/common';
import { environment } from '../environments/environment.development';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, KeyValuePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'angular-demo';


  // Expose environment variables for template
  envVars = {
    production: environment.production,
    apiUrl: environment.apiUrl,
    apiKey: environment.apiKey,
    analyticsEnabled: environment.featureFlags?.analytics,
    darkModeEnabled: environment.featureFlags?.darkMode,
    version: environment.appVersion,
    environmentName: environment.environmentName,
    maxUploadSize: environment.maxUploadSize,
    stripePublicKey: environment.stripePublicKey,
    googleAnalyticsId: environment.googleAnalyticsId,
    sentryDsn: environment.sentryDsn
  };


  constructor() {
    // Environment variables demo
    console.log('Angular Environment Variables:', this.envVars);
  }
}
