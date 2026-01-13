import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Form, FormField, FormError } from '../Form';

describe('Form', () => {
  it('renders children correctly', () => {
    render(
      <Form>
        <div>Test Form</div>
      </Form>
    );
    expect(screen.getByText('Test Form')).toBeInTheDocument();
  });

  it('handles form submission', () => {
    const handleSubmit = jest.fn();
    render(
      <Form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </Form>
    );

    fireEvent.submit(screen.getByRole('form'));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <Form className="custom-class">
        <div>Test Form</div>
      </Form>
    );
    expect(screen.getByRole('form')).toHaveClass('custom-class');
  });
});

describe('FormField', () => {
  it('renders label and children correctly', () => {
    render(
      <FormField label="Test Label" htmlFor="test">
        <input id="test" name="test" type="text" />
      </FormField>
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(
      <FormField label="Test Label" error="Error message" htmlFor="test">
        <input id="test" name="test" type="text" />
      </FormField>
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Error message');
  });

  it('applies custom className', () => {
    render(
      <FormField className="custom-class" htmlFor="test">
        <input id="test" name="test" type="text" />
      </FormField>
    );
    expect(screen.getByRole('group')).toHaveClass('custom-class');
  });
});

describe('FormError', () => {
  it('renders error message correctly', () => {
    render(<FormError>Test error</FormError>);
    expect(screen.getByRole('alert')).toHaveTextContent('Test error');
  });

  it('does not render when no message is provided', () => {
    const { container } = render(<FormError>{''}</FormError>);
    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    render(<FormError className="custom-class">Test error</FormError>);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });
}); 