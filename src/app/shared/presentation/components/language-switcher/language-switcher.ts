import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
    CommonModule
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher implements OnInit {
  private static readonly STORAGE_KEY = 'vital-lang';
  private static readonly DEFAULT_LANG = 'es';

  protected currentLanguage: string = LanguageSwitcher.DEFAULT_LANG;
  protected languages: Language[] = [
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'es', name: 'Español', flag: 'ES' }
  ];

  private translate!: TranslateService;

  constructor(private translateService: TranslateService) {
    this.translate = translateService;
  }

  ngOnInit(): void {
    const stored = localStorage.getItem(LanguageSwitcher.STORAGE_KEY);
    const lang = stored === 'en' || stored === 'es' ? stored : LanguageSwitcher.DEFAULT_LANG;
    this.translate.setDefaultLang(LanguageSwitcher.DEFAULT_LANG);
    this.translate.use(lang);
    this.currentLanguage = lang;
  }

  useLanguage(languageCode: string): void {
    this.translate.use(languageCode);
    this.currentLanguage = languageCode;
    localStorage.setItem(LanguageSwitcher.STORAGE_KEY, languageCode);
  }
}
