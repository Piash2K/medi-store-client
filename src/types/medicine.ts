export type Medicine = {
  id?: string;
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId?: string;
  sellerId?: string;
  manufacturer?: string;
  category?: {
    id?: string;
    _id?: string;
    name?: string;
    description?: string;
  };
  seller?: {
    id?: string;
    name?: string;
    email?: string;
  };
  image?: string;
};

export type MedicinesQueryParams = {
  searchTerm?: string;
  category?: string;
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export type MedicinesResponse = {
  success: boolean;
  message?: string;
  data: Medicine[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
};

export type MedicineResponse = {
  success: boolean;
  message?: string;
  data: Medicine | null;
};

export type Category = {
  _id: string;
  name: string;
};
