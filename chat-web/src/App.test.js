import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Friends Talk header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Friends Talk/i);
  expect(headerElement).toBeInTheDocument();
});
