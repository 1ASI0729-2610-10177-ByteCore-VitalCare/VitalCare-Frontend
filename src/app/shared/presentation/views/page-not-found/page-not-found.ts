import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TranslateModule
  ],
  templateUrl: './page-not-found.html',
  styleUrls: ['./page-not-found.css']
})
export class PageNotFoundComponent {
  invalidPath: string;

  constructor(private router: Router) {
    this.invalidPath = this.router.url;
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
