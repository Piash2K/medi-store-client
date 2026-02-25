export type Medicine = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock?: number;
  manufacturer?: string;
  category?: {
    _id?: string;
    name?: string;
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

export type Category = {
  _id: string;
  name: string;
};
