import { TransactionStatus } from "./transaction";

export type RecentTransaction = {
  totalPrice: number;
  status: TransactionStatus;
  room: {
    name: string;
    property: {
      name: string;
    };
  };
  user: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
};

export type RecentMaintenance = {
  startDate: string;
  endDate: string;
  reason: string;
  room: {
    name: string;
    property: {
      name: string;
    };
  };
};

export type RecentReviews = {
  ratings: number;
  comment: string;
  transaction: {
    user: {
      firstName: string;
      lastName: string;
      avatar: string;
    };
    room: {
      name: string;
      property: {
        name: string;
      };
    };
  };
};

export type TenantActivityResponse = {
  recentTransactions: RecentTransaction[];
  recentMaintenances: RecentMaintenance[];
  recentReviews: RecentReviews[];
}