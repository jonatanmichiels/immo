export interface Property {
  id: number;
  type: 'house' | 'appartement';
  price: number;
  surface: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  garage: number;
}
