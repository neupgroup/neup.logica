
// External packages required by this logic module.
const requiredPackages = [] as const;

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

export type EstateListingPrice = {
  currency: string;
  basis: 'total' | 'perUnit' | 'perMonth' | 'perYear' | 'perUnitPerMonth' | 'perUnitPerYear' | null;
  amount: number | null;
};

export type EstateListingPricingMetadata = {
  priceDisplayMode?: 'show-price' | 'price-on-call' | 'offer-yours-first';
  minimum?: number;
  maximum?: number;
  negotiable?: boolean;
  options?: string[];
  currency?: never;
  listed?: never;
  basis?: never;
  basisPrices?: never;
  basisNegotiable?: never;
  basisNegotiablePrices?: never;
  basisFrequencies?: never;
  basisUnits?: never;
};

export type EstateListingRecord = EstateObjectRecord & {
  price?: EstateListingPrice;
  pricing?: EstateListingPricingMetadata;
  /** Legacy multi-price fields are excluded from the Logica listing contract. */
  prices?: never;
  priceBasis?: never;
  priceCurrency?: never;
  priceAmount?: never;
  purpose?: string;
  category?: string;
  types?: string[];
};

export type EstateListingCreateData = EstateObjectRecord & {
  accountId: string;
  listing: EstateListingRecord;
  postingAgencyId?: string | null;
  workingProfileId?: string | null;
};

export type EstateInquiryCreateData = EstateObjectRecord & {
  listingId?: string;
  listing?: string;
  listing_id?: string;
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
