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

export enum AddressType {
  PICKUP = "pickup",
  DROPOFF = "dropoff",
}

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export enum ProfileType {
  VOLUNTEER = "volunteer",
  AFFECTED = "affected",
  ADMIN = "admin",
}

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

export interface ProfileUser {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  type: ProfileType;
  address?: Address;
  updatedAt?: string;
}

export const APIError = (error: unknown) => {
  return Error(error instanceof Error ? error.message : String(error));
};
