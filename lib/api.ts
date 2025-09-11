const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Types
export interface Property {
  id: string;
  name: string;
  nickname:string
  description: string;
  address: string;
  refNo: string;
  longitude: number;
  latitude: number;
  cleaning_fee:string;
  pets:string;
  pets_fee:string;
  features: string[];
  price: number;
  images: string[];
  bathrooms:string;
  bedrooms: string;
  guests: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyGalleryImage {
  id: string;
  propertyId: string;
  url: string; // Changed from imageUrl to url to match backend
  tag: 'exterior' | 'interior' | 'surroundings';
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  propertyId: string;
  visitorId: string;
  content: string;
  rating?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reply?: string;
  createdAt: string;
  updatedAt: string;
  visitor?: {
    name: string;
    email: string;
  };
  property?: {
    name: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
}

export interface EnquiryBooking {
  id: string;
  propertyId: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobile: string;
  arrivalDate: string;
  departureDate: string;
  adults?: number;
  children?: number;
  message?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  property?: {
    id: string;
    name: string;
    address: string;
    price: number;
  };
}

export interface Visitor {
  id: string;
  name?: string;
  email?: string;
  mobile?: string;
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// API Client
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Try to get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // Helper method to construct full image URLs
  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // For local images, construct URL using base URL without /api
    const imageBaseUrl = this.baseUrl.replace('/api', '');
    return `${imageBaseUrl}${imagePath}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result =  await response.json();
      console.log(result)
      return result
      
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth APIs
  async register(email: string, password: string, name: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/admin/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetCode(email: string, code: string): Promise<{ verified: boolean }> {
    return this.request<{ verified: boolean }>('/auth/admin/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/admin/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    });
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // Property APIs
  async getProperties(): Promise<Property[]> {
    return this.request<Property[]>('/properties');
  }

  async getProperty(id: string): Promise<Property> {
    return this.request<Property>(`/properties/${id}`);
  }

  async createProperty(data: FormData): Promise<Property> {
    const url = `${this.baseUrl}/properties`;
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Property creation error response:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateProperty(id: string, data: FormData): Promise<Property> {
    const url = `${this.baseUrl}/properties/${id}`;
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Property Gallery APIs
  async getPropertyGallery(propertyId: string, tag?: string): Promise<PropertyGalleryImage[]> {
    const endpoint = tag 
      ? `/properties/${propertyId}/gallery?tag=${tag}`
      : `/properties/${propertyId}/gallery`;
    return this.request<PropertyGalleryImage[]>(endpoint);
  }

  async uploadGalleryImages(propertyId: string, data: FormData): Promise<PropertyGalleryImage[]> {
    const url = `${this.baseUrl}/properties/${propertyId}/gallery`;
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ============================================================
  async updateFeaturedImages(propertyId:string, data:FormData){
    const url = `${this.baseUrl}/properties/update-featured-images/${propertyId}`
    const headers: Record<string, string> = {};

    if(this.token){
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body:data
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };
  // ---------------------------------------------------------------

  async deleteGalleryImage(imageId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/properties/gallery/${imageId}`, {
      method: 'DELETE',
    });
  }

  async deleteFeaturedGallery(id:string, imgUrl:string):Promise<Property>{
    return this.request<Property>(`/properties/featured-gallery/${id}`, {
      method: 'POST',
      body:JSON.stringify({url: imgUrl})
    })
  }

  async updateGalleryImage(imageId: string, tag: string):Promise<PropertyGalleryImage> {
    console.log(imageId, tag)
    return this.request<PropertyGalleryImage>(`/properties/gallery/${imageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ tag }),
    });
  }

  // Comment APIs
  async getComments(params?: { status?: string; propertyId?: string }): Promise<Comment[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    
    const endpoint = searchParams.toString() 
      ? `/comments?${searchParams.toString()}`
      : '/comments';
    return this.request<Comment[]>(endpoint);
  }

  async approveComment(id: string): Promise<Comment> {
    return this.request<Comment>(`/comments/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectComment(id: string): Promise<Comment> {
    return this.request<Comment>(`/comments/${id}/reject`, {
      method: 'PATCH',
    });
  }

  async replyToComment(id: string, reply: string): Promise<Comment> {
    return this.request<Comment>(`/comments/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    });
  }

  async deleteComment(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  // Enquiry Booking APIs
  async getEnquiryBookings(params?: { status?: string; propertyId?: string }): Promise<EnquiryBooking[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.propertyId) searchParams.append('propertyId', params.propertyId);
    
    const endpoint = searchParams.toString() 
      ? `/enquiry-bookings?${searchParams.toString()}`
      : '/enquiry-bookings';
    return this.request<EnquiryBooking[]>(endpoint);
  }

  async getEnquiryBooking(id: string): Promise<EnquiryBooking> {
    return this.request<EnquiryBooking>(`/enquiry-bookings/${id}`);
  }

  async updateEnquiryBooking(id: string, data: Partial<EnquiryBooking>): Promise<EnquiryBooking> {
    return this.request<EnquiryBooking>(`/enquiry-bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEnquiryBooking(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/enquiry-bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async getEnquiryBookingsCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/enquiry-bookings/count');
  }

  async confirmEnquiryBooking(id: string): Promise<EnquiryBooking> {
    return this.request<EnquiryBooking>(`/enquiry-bookings/${id}/confirm`, {
      method: 'PATCH',
    });
  }

  async cancelEnquiryBooking(id: string): Promise<EnquiryBooking> {
    return this.request<EnquiryBooking>(`/enquiry-bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  // Visitor/Customer APIs
  async getVisitors(): Promise<Visitor[]> {
    return this.request<Visitor[]>('/visitors');
  }

  async getVisitor(id: string): Promise<Visitor> {
    return this.request<Visitor>(`/visitors/${id}`);
  }

  async createVisitor(data: { name: string; email?: string; mobile?: string }): Promise<Visitor> {
    return this.request<Visitor>('/visitors/admin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVisitor(id: string, data: Partial<Visitor>): Promise<Visitor> {
    return this.request<Visitor>(`/visitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVisitor(id: string): Promise<{ success: boolean }> {
    return this.request(`/visitors/${id}`, { method: 'DELETE' });
  }

  // User Profile Management
  async getUserProfile(): Promise<User> {
    return this.request('/auth/admin/profile');
  }

  async updateUserProfile(data: { name: string; email: string }): Promise<User> {
    return this.request('/auth/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/auth/admin/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.request('/auth/admin/avatar', {
      method: 'POST',
      body: formData,
    });
  }

  // Settings Management
  async getSettings(category?: string): Promise<Array<{ key: string; value: string; category: string; description?: string }>> {
    const params = category ? `?category=${category}` : '';
    return this.request(`/settings${params}`);
  }

  async updateSettings(settings: Array<{ key: string; value: string; category?: string; description?: string }>): Promise<Array<{ key: string; value: string; category: string; description?: string }>> {
    return this.request('/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
  }

  async getSetting(key: string): Promise<{ key: string; value: string; category: string; description?: string }> {
    return this.request(`/settings/${key}`);
  }

  async updateSetting(key: string, value: string): Promise<{ key: string; value: string; category: string; description?: string }> {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL); 