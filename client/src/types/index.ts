export interface Business {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  latitude: number;
  longitude: number;
  categoryId: number;
  ownerId?: number;
  claimed: boolean;
  rating?: number;
  priceLevel?: number;
  website?: string;
  phone?: string;
  images?: string[];
  tags?: string[];
  amenities?: string[];
  createdAt: Date;
  googlePlaceId?: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isBusiness: boolean;
  createdAt: Date;
}

export interface ClaimRequest {
  id: number;
  businessId: number;
  userId: number;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl?: string;
  createdAt: Date;
}

export interface SearchFilter {
  keyword?: string;
  categoryId?: number;
  priceLevel?: number[];
  amenities?: string[];
  accessibility?: string[];
  rating?: number;
  nearMe?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
}
