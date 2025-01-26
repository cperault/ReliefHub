export enum State {
  Alabama = "AL",
  Alaska = "AK",
  Arizona = "AZ",
  Arkansas = "AR",
  California = "CA",
  Colorado = "CO",
  Connecticut = "CT",
  Delaware = "DE",
  Florida = "FL",
  Georgia = "GA",
  Hawaii = "HI",
  Idaho = "ID",
  Illinois = "IL",
  Indiana = "IN",
  Iowa = "IA",
  Kansas = "KS",
  Kentucky = "KY",
  Louisiana = "LA",
  Maine = "ME",
  Maryland = "MD",
  Massachusetts = "MA",
  Michigan = "MI",
  Minnesota = "MN",
  Mississippi = "MS",
  Missouri = "MO",
  Montana = "MT",
  Nebraska = "NE",
  Nevada = "NV",
  NewHampshire = "NH",
  NewJersey = "NJ",
  NewMexico = "NM",
  NewYork = "NY",
  NorthCarolina = "NC",
  NorthDakota = "ND",
  Ohio = "OH",
  Oklahoma = "OK",
  Oregon = "OR",
  Pennsylvania = "PA",
  RhodeIsland = "RI",
  SouthCarolina = "SC",
  SouthDakota = "SD",
  Tennessee = "TN",
  Texas = "TX",
  Utah = "UT",
  Vermont = "VT",
  Virginia = "VA",
  Washington = "WA",
  WestVirginia = "WV",
  Wisconsin = "WI",
  Wyoming = "WY",
}

/**
 * Represents the type of address in the system.
 * - PICKUP: Used for offer locations where volunteers can provide items
 * - DROPOFF: Used for affected user profiles and request locations where items need to be delivered
 */
export enum AddressType {
  PICKUP = "pickup",
  DROPOFF = "dropoff",
}

/**
 * Represents an address in the system.
 * For user profiles:
 * - Required for affected users (always DROPOFF type)
 * - Not used for volunteer profiles
 *
 * For requests/offers:
 * - DROPOFF type for request locations
 * - PICKUP type for offer locations
 */
export interface Address {
  type: AddressType;
  street: string;
  state: State;
  city: string;
  zip: string;
  position: Coordinates;
  label?: string;
  notes?: string;
  contactPhone?: string;
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};
