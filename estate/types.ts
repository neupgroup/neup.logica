/*
::neup.documentation::logica-estate-types
::title Logica Estate Shared Types

Shared object API types for estate SDK modules.

::public

These types are reused by nested estate object modules.

::public end

::end
*/

export type EstateObjectRecord = Record<string, unknown>;

export type EstatePropertyCreateData = EstateObjectRecord & {
  accountId?: string;
  property?: EstateObjectRecord;
  postingAgencyId?: string | null;
  workingProfileId?: string | null;
};

export type EstateInquiryCreateData = EstateObjectRecord & {
  propertyId?: string;
  property?: string;
  property_id?: string;
  phone?: string;
  email?: string;
  message?: string;
  name?: string;
  account_id?: string;
};

export type EstateRequirementData = EstateObjectRecord & {
  minBudget?: number | null;
  maxBudget?: number | null;
  location?: string | null;
  propertyType?: string[];
  purpose?: string | null;
  urgency?: string | null;
  requiredTime?: string | null;
  paymentMethod?: string[];
  loan?: boolean;
};

export type EstateViewingData = EstateObjectRecord & {
  propertyId?: string;
  agentId?: string;
  scheduledAt?: string;
};

export type EstateOfferData = EstateObjectRecord & {
  propertyId?: string;
  amount?: number;
  currency?: string;
};
