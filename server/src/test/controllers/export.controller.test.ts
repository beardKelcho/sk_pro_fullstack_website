import { Request, Response } from 'express';
import * as exportController from '../../controllers/export.controller';
import { Equipment, Project, Client } from '../../models';

// Mock models
jest.mock('../../models', () => ({
  Equipment: { find: jest.fn(), countDocuments: jest.fn() },
  Project: { find: jest.fn(), countDocuments: jest.fn() },
  Task: { find: jest.fn(), countDocuments: jest.fn() },
  Client: { find: jest.fn(), countDocuments: jest.fn() },
  Maintenance: { find: jest.fn() },
  User: { find: jest.fn() }
}));

// Mock ExcelJS
jest.mock('exceljs', () => {
  return {
    __esModule: true,
    default: {
      Workbook: jest.fn().mockImplementation(() => ({
        addWorksheet: jest.fn().mockReturnValue({
          addRow: jest.fn(),
          getRow: jest.fn().mockReturnValue({ font: {}, fill: {}, alignment: {} }),
          getColumn: jest.fn().mockReturnValue({ width: 0 }),
        }),
        xlsx: { write: jest.fn().mockResolvedValue(undefined) },
      })),
    },
  };
});

// Mock PDFKit
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    rect: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    end: jest.fn(),
    y: 0,
    page: { width: 500, height: 800 },
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis()
  }));
});

// Mock Audit Logger
jest.mock('../../utils/auditLogger', () => ({
  logAction: jest.fn()
}));

describe('Export Controller (Generic)', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSetHeader: jest.Mock;
  let mockEnd: jest.Mock;
  let mockWrite: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockSetHeader = jest.fn();
    mockEnd = jest.fn();
    mockWrite = jest.fn();

    mockRequest = {
      user: { id: 'test-user-id' } as unknown as import('../../models/User').IUser,
      query: {},
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' } as unknown as import('net').Socket,
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      setHeader: mockSetHeader,
      end: mockEnd,
      write: mockWrite,
    };

    jest.clearAllMocks();
  });

  describe('CSV Export', () => {
    it('should export equipment as CSV by default', async () => {
      mockRequest.query = { type: 'equipment' };
      const mockEquipment = [{ name: 'Test Eq', type: 'Test Type' }];

      (Equipment.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockEquipment)
      });

      await exportController.exportData(mockRequest as Request, mockResponse as Response);

      expect(Equipment.find).toHaveBeenCalled();
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=equipment-export.csv');
      expect(mockWrite).toHaveBeenCalledWith('\ufeff');
      expect(mockEnd).toHaveBeenCalled();
    });
  });

  describe('Excel Export', () => {
    it('should export projects as Excel', async () => {
      mockRequest.query = { type: 'projects', format: 'excel' };
      const mockProjects = [{ name: 'Test Project' }];

      const pFind = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockProjects)
          })
        })
      });
      (Project.find as unknown as jest.Mock) = pFind;

      await exportController.exportData(mockRequest as Request, mockResponse as Response);

      expect(pFind).toHaveBeenCalled();
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=projects-export.xlsx');
    });
  });

  describe('PDF Export', () => {
    it('should export clients as PDF', async () => {
      mockRequest.query = { type: 'clients', format: 'pdf' };
      const mockClients = [{ name: 'Client A' }];

      (Client.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockClients)
      });

      await exportController.exportData(mockRequest as Request, mockResponse as Response);

      expect(Client.find).toHaveBeenCalled();
      expect(mockSetHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=clients-export.pdf');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing type parameter', async () => {
      mockRequest.query = { format: 'csv' };

      await exportController.exportData(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Veri tipi (type) gereklidir'
      });
    });

    it('should handle invalid type parameter', async () => {
      mockRequest.query = { type: 'invalid_type' };

      await exportController.exportData(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Geçersiz veri tipi'
      });
    });

    it('should handle database errors', async () => {
      mockRequest.query = { type: 'equipment' };

      (Equipment.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await exportController.exportData(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });
});
