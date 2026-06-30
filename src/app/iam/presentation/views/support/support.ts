import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SupportService, SupportTicket } from '../../../infrastructure/services/support.service';
import { AuthService } from '../../../application/services/auth.service';

interface FaqItem {
  questionKey: string;
  answerKey: string;
  open: boolean;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class Support implements OnInit {
  private supportService = inject(SupportService);
  private authService = inject(AuthService);
  readonly translate = inject(TranslateService);

  readonly topicKeys = [
    'support.topic_app_error',
    'support.topic_patch',
    'support.topic_billing',
    'support.topic_plan',
    'support.topic_data',
    'support.topic_other',
  ];

  subject = '';
  reportName = '';
  description = '';

  readonly sending = signal(false);
  readonly sendSuccess = signal(false);
  readonly sendError = signal(false);

  readonly showHistory = signal(false);
  readonly tickets = signal<SupportTicket[]>([]);
  readonly loadingHistory = signal(false);

  readonly faqs: FaqItem[] = [
    { questionKey: 'support.faq_q1', answerKey: 'support.faq_a1', open: false },
    { questionKey: 'support.faq_q2', answerKey: 'support.faq_a2', open: false },
    { questionKey: 'support.faq_q3', answerKey: 'support.faq_a3', open: false },
    { questionKey: 'support.faq_q4', answerKey: 'support.faq_a4', open: false },
    { questionKey: 'support.faq_q5', answerKey: 'support.faq_a5', open: false },
  ];

  ngOnInit(): void {}

  toggleFaq(item: FaqItem): void {
    item.open = !item.open;
  }

  submit(): void {
    if (!this.subject || !this.reportName || !this.description) return;

    const userId = this.authService.currentUser()?.id;
    if (!userId) { this.sendError.set(true); return; }

    this.sending.set(true);
    this.sendSuccess.set(false);
    this.sendError.set(false);

    const ticket: SupportTicket = {
      subject: this.reportName,
      message: this.description,
      users_id: userId,
      status: 'OPEN',
    };

    this.supportService.createTicket(ticket).subscribe({
      next: () => {
        this.sending.set(false);
        this.sendSuccess.set(true);
        this.subject = '';
        this.reportName = '';
        this.description = '';
      },
      error: () => {
        this.sending.set(false);
        this.sendError.set(true);
      },
    });
  }

  viewHistory(): void {
    const userId = this.authService.currentUser()?.id;
    if (!userId) return;
    this.showHistory.set(true);
    this.loadingHistory.set(true);
    this.supportService.getTicketsByUser(userId).subscribe({
      next: data => {
        this.tickets.set(data);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false),
    });
  }

  closeHistory(): void {
    this.showHistory.set(false);
  }

  statusColor(status: string = ''): string {
    const map: Record<string, string> = {
      OPEN: '#f44336',
      IN_PROGRESS: '#ff9800',
      CLOSED: '#4caf50',
    };
    return map[status] ?? '#64748b';
  }
}
