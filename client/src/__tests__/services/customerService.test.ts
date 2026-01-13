/**
 * Customer Service Tests
 */

import { getAllCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, useCustomers, useCustomerById } from '@/services/customerService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Customer Service', () => {
  const mockCustomer = {
    _id: '1',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '05551234567',
    companyName: 'Test Company',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCustomers', () => {
    it('should fetch all customers', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockCustomer],
          total: 1,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getAllCustomers();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/customers', expect.any(Object));
    });

    it('should fetch customers with filters', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [mockCustomer],
          total: 1,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getAllCustomers({
        search: 'Test',
          page: 1,
          limit: 10,
      });

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/customers',
        expect.objectContaining({
          params: expect.objectContaining({
            search: 'Test',
            page: 1,
            limit: 10,
          }),
        })
      );
    });

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(getAllCustomers()).rejects.toThrow();
    });
  });

  describe('getCustomerById', () => {
    it('should fetch customer by id', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: mockCustomer,
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getCustomerById('1');

      expect(result).toEqual(mockCustomer);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/customers/1');
    });

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Not found'));

      await expect(getCustomerById('1')).rejects.toThrow();
    });
  });

  describe('createCustomer', () => {
    it('should create a new customer', async () => {
      const newCustomer = {
        name: 'New Customer',
        email: 'new@example.com',
        phone: '05551234567',
      };

      const mockResponse = {
        data: {
          success: true,
          data: { ...newCustomer, _id: '2' },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await createCustomer(newCustomer);

      expect(result).toEqual(mockResponse.data.data);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/customers', newCustomer);
    });

    it('should handle errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Validation error'));

      await expect(createCustomer({} as any)).rejects.toThrow();
    });
  });

  describe('updateCustomer', () => {
    it('should update a customer', async () => {
      const updatedCustomer = {
        ...mockCustomer,
        name: 'Updated Customer',
      };

      const mockResponse = {
        data: {
          success: true,
          data: updatedCustomer,
        },
      };

      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await updateCustomer('1', { name: 'Updated Customer' });

      expect(result).toEqual(updatedCustomer);
      expect(mockedAxios.put).toHaveBeenCalledWith('/api/customers/1', { name: 'Updated Customer' });
    });

    it('should handle errors', async () => {
      mockedAxios.put.mockRejectedValue(new Error('Not found'));

      await expect(updateCustomer('1', {})).rejects.toThrow();
    });
  });

  describe('deleteCustomer', () => {
    it('should delete a customer', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Customer deleted',
        },
      };

      mockedAxios.delete.mockResolvedValue(mockResponse);

      await deleteCustomer('1');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/customers/1');
    });

    it('should handle errors', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('Not found'));

      await expect(deleteCustomer('1')).rejects.toThrow();
    });
  });
});

