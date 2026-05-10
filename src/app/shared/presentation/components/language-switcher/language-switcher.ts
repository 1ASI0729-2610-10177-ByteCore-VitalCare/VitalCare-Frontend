// language-switcher.ts - COPIAR Y PEGAR
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { CommonModule } from '@angular/common';

interface Language {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher implements OnInit {
  protected currentLanguage: string = 'en';
  protected languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  private translate!: TranslateService;

  constructor(private translateService: TranslateService) {
    this.translate = translateService;
  }

  ngOnInit(): void {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.currentLanguage = 'en';
  }

  useLanguage(languageCode: string): void {
    this.translate.use(languageCode);
    this.currentLanguage = languageCode;
  }
}
