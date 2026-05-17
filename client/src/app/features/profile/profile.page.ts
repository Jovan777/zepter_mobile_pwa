import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <section class="page-placeholder">
      <p class="eyebrow">Zepter Mobile PWA</p>
      <h1>Moj profil</h1>
      <p>Podaci korisnika i marketing plan.</p>
    </section>
  `,
  styles: [
    `
      .page-placeholder {
        min-height: 100dvh;
        padding: 32px 20px;
        display: grid;
        align-content: center;
        gap: 12px;
        color: var(--zepter-text);
      }

      .eyebrow {
        margin: 0;
        color: var(--zepter-blue);
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      h1 {
        margin: 0;
        font-size: 32px;
        line-height: 1.05;
      }

      p {
        margin: 0;
        color: var(--zepter-muted);
        line-height: 1.6;
      }
    `
  ]
})
export class ProfilePage {}
