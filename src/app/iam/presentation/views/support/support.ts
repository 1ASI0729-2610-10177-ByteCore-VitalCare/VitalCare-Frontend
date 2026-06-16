import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService, SupportTicket } from '../../../infrastructure/services/support.service';

const CURRENT_USER_ID = 1;

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

const SUBJECT_OPTIONS = [
  'Error en la aplicación',
  'Problema con el parche',
  'Facturación y pagos',
  'Cambio de plan',
  'Datos incorrectos',
  'Otro',
];

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class Support implements OnInit {
  private supportService = inject(SupportService);

  readonly subjectOptions = SUBJECT_OPTIONS;

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
    {
      question: '¿Cómo puedo hacer un reporte?',
      answer: 'Completa el formulario de la derecha con el tema, nombre y descripción del reporte y presiona "Enviar".',
      open: false,
    },
    {
      question: '¿Cómo puedo ver mi reporte?',
      answer: 'Presiona el botón "Ver Historial" para consultar todos los tickets que has enviado.',
      open: false,
    },
    {
      question: '¿Cómo puedo ver el estado de mi parche?',
      answer: 'Dirígete a la sección de Pacientes y selecciona el paciente cuyo parche deseas revisar.',
      open: false,
    },
    {
      question: '¿Cada cuánto tiempo tengo que reemplazar el parche?',
      answer: 'Se recomienda reemplazar el parche cada 7 días o antes si el sistema indica batería baja.',
      open: false,
    },
    {
      question: '¿Cómo registrar otro paciente?',
      answer: 'Ve a la sección de Pacientes y utiliza el botón "Agregar Paciente" para registrar uno nuevo.',
      open: false,
    },
  ];

  ngOnInit(): void {}

  toggleFaq(item: FaqItem): void {
    item.open = !item.open;
  }

  submit(): void {
    if (!this.subject || !this.reportName || !this.description) return;

    this.sending.set(true);
    this.sendSuccess.set(false);
    this.sendError.set(false);

    const ticket: SupportTicket = {
      subject: this.reportName,
      message: this.description,
      users_id: CURRENT_USER_ID,
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
    this.showHistory.set(true);
    this.loadingHistory.set(true);
    this.supportService.getTicketsByUser(CURRENT_USER_ID).subscribe({
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
