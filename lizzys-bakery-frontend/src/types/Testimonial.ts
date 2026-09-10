// Matches TestimonialSerializer (public) — just what the homepage card shows.
export default interface Testimonial {
  id: number;
  author_name: string;
  quote: string;
  occasion: string;
}

// Matches AdminTestimonialSerializer — full record for the management page.
export interface AdminTestimonial extends Testimonial {
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export type AdminTestimonialInput = Omit<AdminTestimonial, 'id' | 'created_at'>;
