import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbar, MatToolbarRow } from '@angular/material/toolbar';
import { MatButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';

interface NavOption {
  link: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbar,
    MatToolbarRow,
    MatButton,
    MatIcon,
    MatTooltip,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitcher,
    RouterOutlet
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  navOptions = signal<NavOption[]>([
    { link: '/home', label: 'nav.home', icon: 'home' },
    { link: '/patients', label: 'nav.patients', icon: 'people' },
    { link: '/plans', label: 'nav.plans', icon: 'assignment' },
    { link: '/support', label: 'nav.support', icon: 'help' },
    { link: '/notification', label: 'nav.notifications', icon: 'notifications' },
  ]);
}
