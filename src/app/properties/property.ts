export interface Property {
  id: number;
  type: 'house' | 'apartement';
  price: number;
  surface: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
}
