export type OrderItem = {
  id: string;
  orderId: string;
  medicineId: string;
  quantity: number;
  price: number;
  createdAt: string;
  medicine?: {
    id: string;
    name: string;
    price: number;
    manufacturer?: string;
  };
};

export type Order = {
  id: string;
  customerId: string;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: {
    id?: string;
    name?: string;
    email?: string;
  };
};

export type OrdersResponse = {
  success: boolean;
  message?: string;
  data: Order[];
};

export type OrderResponse = {
  success: boolean;
  message?: string;
  data: Order | null;
};
