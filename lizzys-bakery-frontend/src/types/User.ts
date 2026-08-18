// shape of the user object returned by /api/auth/me/
export default interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  role: 'CUSTOMER' | 'ADMIN';
  date_joined: string;
}