interface SessionData {
  userId: string;
  templateId: string;
  documentId: string;
  currentStep: number;
  currentFieldIndex: number;
  formData: Record<string, any>;
  fields: Array<{
    id: string;
    fieldName: string;
    fieldType: string;
    label: string;
    placeholder?: string;
    isRequired: boolean;
    options?: string;
    stepNumber: number;
  }>;
}

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();

  createSession(telegramId: string, data: Omit<SessionData, 'currentStep' | 'currentFieldIndex' | 'formData'>) {
    const session: SessionData = {
      ...data,
      currentStep: 1,
      currentFieldIndex: 0,
      formData: {}
    };

    this.sessions.set(telegramId, session);
    return session;
  }

  getSession(telegramId: string): SessionData | undefined {
    return this.sessions.get(telegramId);
  }

  updateSession(telegramId: string, updates: Partial<SessionData>) {
    const session = this.sessions.get(telegramId);
    if (session) {
      Object.assign(session, updates);
      this.sessions.set(telegramId, session);
    }
  }

  saveFieldData(telegramId: string, fieldName: string, value: any) {
    const session = this.sessions.get(telegramId);
    if (session) {
      session.formData[fieldName] = value;
      this.sessions.set(telegramId, session);
    }
  }

  nextField(telegramId: string): boolean {
    const session = this.sessions.get(telegramId);
    if (!session) return false;

    session.currentFieldIndex++;

    // Проверяем, закончились ли поля текущего шага
    const currentStepFields = session.fields.filter(f => f.stepNumber === session.currentStep);

    if (session.currentFieldIndex >= currentStepFields.length) {
      // Переходим к следующему шагу
      session.currentStep++;
      session.currentFieldIndex = 0;

      // Проверяем, есть ли еще шаги
      const nextStepFields = session.fields.filter(f => f.stepNumber === session.currentStep);
      if (nextStepFields.length === 0) {
        return false; // Форма завершена
      }
    }

    this.sessions.set(telegramId, session);
    return true;
  }

  getCurrentField(telegramId: string) {
    const session = this.sessions.get(telegramId);
    if (!session) return null;

    const currentStepFields = session.fields.filter(f => f.stepNumber === session.currentStep);
    return currentStepFields[session.currentFieldIndex] || null;
  }

  isFormComplete(telegramId: string): boolean {
    const session = this.sessions.get(telegramId);
    if (!session) return false;

    const nextStepFields = session.fields.filter(f => f.stepNumber === session.currentStep);
    return nextStepFields.length === 0;
  }

  deleteSession(telegramId: string) {
    this.sessions.delete(telegramId);
  }

  getTotalSteps(telegramId: string): number {
    const session = this.sessions.get(telegramId);
    if (!session) return 0;

    return Math.max(...session.fields.map(f => f.stepNumber), 0);
  }
}

export const sessionManager = new SessionManager();
