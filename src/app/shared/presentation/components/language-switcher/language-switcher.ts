import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGE_STORAGE_KEY = 'vitalcare-language';
const SUPPORTED_LANGUAGES = ['en', 'es'];

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher implements OnInit {
  protected currentLanguage: string = 'es';
  protected languages: Language[] = [
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'es', name: 'Spanish', flag: 'ES' }
  ];

  constructor(private readonly translate: TranslateService) {}

  ngOnInit(): void {
    this.translate.addLangs(SUPPORTED_LANGUAGES);
    this.translate.setDefaultLang('es');

    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browserLanguage = this.translate.getBrowserLang();
    const initialLanguage = this.resolveLanguage(savedLanguage ?? browserLanguage ?? 'es');

    this.useLanguage(initialLanguage);
  }

  useLanguage(languageCode: string): void {
    const language = this.resolveLanguage(languageCode);
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }

  private resolveLanguage(languageCode: string): string {
    return SUPPORTED_LANGUAGES.includes(languageCode) ? languageCode : 'es';
  }
}
