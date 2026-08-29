// TEMP placeholder — real version with order history comes in Week 6
import { useAuth } from '../../hooks/useAuth';

export default function AccountPage() {
  const { user } = useAuth();

  return (
    <div className="bg-bakery-pink/10 min-h-[70vh] py-16 px-4">
      <div className="max-w-2xl mx-auto font-body bg-white rounded-2xl shadow-sm p-8 border-t-4 border-bakery-pink-dark">
        <h1 className="font-script text-4xl text-bakery-pink-dark mb-4">My Account</h1>
        <p className="text-bakery-brown">Logged in as: {user?.email}</p>
        <p className="text-bakery-brown">Role: {user?.role}</p>
        <p className="text-bakery-brown/60 text-sm mt-6">
          (Order history and saved details arrive in Week 6.)
        </p>
      </div>
    </div>
  );
}