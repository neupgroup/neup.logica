/** Supported shared lead activity categories. */
export type LeadActivityType = 'follow_up' | 'visit' | 'meeting' | 'remarks';

/** Supported contact methods for follow-up activities. */
export type FollowUpMethod = 'phone call' | 'whatsapp' | 'email';

/** Input accepted when recording a shared lead activity. */
export interface AddLeadActivityInput {
  leadId: string;
  accountId: string;
  activityType: LeadActivityType;
  activityOn?: string;
  followUpMethod?: FollowUpMethod;
  propertyId?: string;
  remarks: string;
}
