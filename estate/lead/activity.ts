import { prisma } from '@neup/core/database/prisma';
import { getAccountById } from '@/services/accounts/id/get';
import { getAgencyAgentMapsByAgent } from '@/services/agencies/agent-maps/service';
import { createLeadActivity, type LeadActivityType } from '@/services/leads/activity/create';

export type FollowUpMethod = 'phone call' | 'whatsapp' | 'email';

export interface AddLeadActivityInput {
  leadId: string;
  accountId: string;
  activityType: LeadActivityType;
  activityOn?: string;
  followUpMethod?: FollowUpMethod;
  propertyId?: string;
  remarks: string;
}

/** Checks whether the account can access a shared lead's activity timeline. */
export async function getVisibleLead(leadId: string, accountId: string) {
  const [lead, account, agencyLinks] = await Promise.all([
    prisma.sharedLeads.findUnique({ where: { id: leadId }, select: { id: true, owner: true } }),
    getAccountById(accountId),
    getAgencyAgentMapsByAgent(accountId),
  ]);
  if (!lead) return null;

  const canViewAll = ['brand', 'brand.agency', 'subbrand', 'subbrand.agency'].includes(account?.account_type ?? '')
    || agencyLinks.some((link) => link.status === 'accepted' && link.isAdmin);
  return canViewAll || lead.owner === accountId ? lead : null;
}

/** Returns a shared lead's activity timeline, newest activity first. */
export async function getLeadActivities(leadId: string) {
  return prisma.leadActivity.findMany({
    where: { leadId },
    orderBy: { activityOn: 'desc' },
  });
}

/** Adds a validated activity to a shared lead and returns the created record. */
export async function addLeadActivity(input: AddLeadActivityInput) {
  const account = await prisma.account.findUnique({
    where: { id: input.accountId },
    select: { displayName: true },
  });
  const activityId = await createLeadActivity({
    leadId: input.leadId,
    activityType: input.activityType,
    activityOn: input.activityOn,
    followUpMethod: input.followUpMethod,
    propertyId: input.propertyId,
    remarks: input.remarks,
    activityBy: account?.displayName?.trim() || input.accountId,
  });

  return prisma.leadActivity.findUnique({ where: { id: activityId } });
}
