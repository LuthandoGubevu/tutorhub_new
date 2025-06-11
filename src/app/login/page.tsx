// src/app/login/page.tsx
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <LoginForm />
    </div>
  );
}
