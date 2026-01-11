export type User = {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isAdmin?: boolean;
};

export type Category = {
  _id?: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  color?: string;
  isActive?: boolean;
  userid?: string | User;
};

export type LocalSpot = {
  _id?: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  userid?: string;
  category?: string | Category;
  img?: string;
  imgPublicId?: string;
};

export type Db = {
  userStore: any;
  localspotStore: any;
  categoryStore: any;
};