import type { Diet } from "../strategies/DietStrategy";

export type ReservationDraft = Readonly<{
  date: string;
  guests: number;
  diet: Diet;
}>;

export type ReservationValidation =
  | { valid: true }
  | { valid: false; message: string };

/** Keeps booking validation and outbound message formatting independent of UI. */
export class ReservationService {
  public validate(draft: ReservationDraft, today: string): ReservationValidation {
    if (!draft.date) return { valid: false, message: "Choose a date for your table." };
    if (draft.date < today) return { valid: false, message: "Choose today or a future date for your table." };
    if (!Number.isInteger(draft.guests) || draft.guests < 1 || draft.guests > 20) {
      return { valid: false, message: "Choose between 1 and 20 guests." };
    }
    return { valid: true };
  }

  public createWhatsAppMessage(draft: ReservationDraft): string {
    const preference = draft.diet === "veg" ? "Pure vegetarian" : "Non-vegetarian";
    return [
      "Hello, I would like to ask about a table at HSR Coastal Curry.",
      `Date: ${draft.date}`,
      `Guests: ${draft.guests}`,
      `Preference: ${preference}`,
      "Please confirm availability and timings.",
    ].join("\n");
  }
}

export const reservationService = new ReservationService();
