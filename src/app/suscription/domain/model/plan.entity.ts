export interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  isPopular: boolean;
}

export interface Subscription {
  id: number;
  plan: string;
  price: number;
  startDate: string;
  endDate: string;
  status: string;
  userId: number;
}
