import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the useAuth hook
jest.mock('@/providers/auth-provider', () => ({
  useAuth: () => ({
    login: jest.fn(),
  }),
}));

describe('LoginPage', () => {
  it('renders a sign in heading', () => {
    render(<LoginPage />);

    const heading = screen.getByRole('heading', { name: /Welcome back/i });

    expect(heading).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
});
