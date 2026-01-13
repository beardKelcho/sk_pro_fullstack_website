import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, FormField, FormError } from '../Form';

describe('FormValidation', () => {
  describe('Form', () => {
    it('handles form submission correctly', async () => {
      const handleSubmit = jest.fn();
      render(
        <Form onSubmit={handleSubmit}>
          <FormField label="İsim" htmlFor="name">
            <input type="text" name="name" id="name" />
          </FormField>
          <button type="submit">Gönder</button>
        </Form>
      );

      const input = screen.getByLabelText('İsim');
      await userEvent.type(input, 'John');
      
      const submitButton = screen.getByText('Gönder');
      fireEvent.click(submitButton);

      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('FormField', () => {
    it('renders label correctly', () => {
      render(
        <FormField label="Test Label" htmlFor="test">
          <input type="text" name="test" id="test" />
        </FormField>
      );
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FormField className="custom-class" htmlFor="test">
          <input type="text" name="test" id="test" />
        </FormField>
      );
      expect(screen.getByRole('group')).toHaveClass('custom-class');
    });
  });

  describe('FormError', () => {
    it('renders error message', () => {
      render(<FormError>Test error message</FormError>);
      expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
    });

    it('applies custom className', () => {
      render(<FormError className="custom-error">Test error</FormError>);
      expect(screen.getByRole('alert')).toHaveClass('custom-error');
    });
  });
}); 