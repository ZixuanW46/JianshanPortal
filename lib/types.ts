export interface Application {
    id: string;
    userId: string;
    status: 'draft' | 'submitted' | 'under_review' | 'decision_released' | 'enrolled' | 'rejected' | 'waitlisted';
    submittedAt?: string; // ISO Date
    registeredAt?: string; // ISO Date
    decisionReleasedAt?: string; // ISO Date
    enrolledAt?: string; // ISO Date
    lastUpdatedAt: string; // ISO Date
    // Form Data (simplified for now)
    personalInfo: {
        // firstName: string;
        // lastName: string;
        name?: string; // Chinese Name
        englishName?: string;
        gender?: string;
        birthDate?: string;
        nationality?: string;
        idNumber?: string; // ID Card or Passport
        phone: string;
        email?: string;
        wechatId?: string;
        emergencyContactName?: string;
        emergencyContactPhone?: string;
        school: string;
        grade: string;
        interests?: string[]; // Max 3
        englishProficiency?: string; // Score or File URL
    };
    essays: {
        // question1?: string;
        // question2?: string;
        q1Option?: string; // Selected option for Q1
        q1Content?: string; // Content for Q1
        q2Content?: string; // Content for Q2 (English)
    };
    misc?: {
        healthCondition?: string;
        dietaryRestrictions?: string;
        referralSource?: string;
        goals?: string[];
        agreedToTerms?: boolean;
    };
}
