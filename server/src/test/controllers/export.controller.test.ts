import { Request, Response } from 'express';
import * as exportController from '../../controllers/export.controller';
import { Equipment, Project } from '../../models';
import mongoose from 'mongoose';

// Mock models
jest.mock('../../models', () => ({
  Equipment: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
  Project: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
  Task: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
  Client: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
  Maintenance: {
    find: jest.fn(),
  },
}));

// Mock ExcelJS
jest.mock('exceljs', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      addWorksheet: jest.fn().mockReturnValue({
        addRow: jest.fn(),
        getRow: jest.fn().mockReturnValue({
          font: {},
          fill: {},
          alignment: {},
        }),
        getColumn: jest.fn().mockReturnValue({
          width: 0,
        }),
      }),
      xlsx: {
        write: jest.fn().mockResolvedValue(undefined),
      },
    })),
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
  }));
});

describe('Export Controller', () => {
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
      user: { id: 'test-user-id' },
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

  describe('exportEquipment (CSV)', () => {
    it('should export equipment as CSV successfully', async () => {
      const mockEquipment = [
        {
          name: 'Test Equipment',
          type: 'VideoSwitcher',
          model: 'Test Model',
          serialNumber: 'SN123',
          status: 'AVAILABLE',
          location: 'Depo',
          responsibleUser: { name: 'Test User' },
          notes: 'Test notes',
        },
      ];

      (Equipment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockEquipment),
        }),
      });

      await exportController.exportEquipment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Equipment.find).toHaveBeenCalled();
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8'
      );
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=equipment-export.csv'
      );
      expect(mockWrite).toHaveBeenCalledWith('\ufeff');
      expect(mockEnd).toHaveBeenCalled();
    });

    it('should handle errors when exporting equipment', async () => {
      (Equipment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await exportController.exportEquipment(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Export işlemi sırasında bir hata oluştu',
      });
    });
  });

  describe('exportEquipmentExcel', () => {
    it('should export equipment as Excel successfully', async () => {
      const mockEquipment = [
        {
          name: 'Test Equipment',
          type: 'VideoSwitcher',
          model: 'Test Model',
          serialNumber: 'SN123',
          status: 'AVAILABLE',
          location: 'Depo',
          responsibleUser: { name: 'Test User' },
          notes: 'Test notes',
        },
      ];

      (Equipment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockEquipment),
        }),
      });

      await exportController.exportEquipmentExcel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Equipment.find).toHaveBeenCalled();
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=equipment-export.xlsx'
      );
    });

    it('should handle errors when exporting equipment as Excel', async () => {
      (Equipment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await exportController.exportEquipmentExcel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Export işlemi sırasında bir hata oluştu',
      });
    });
  });

  describe('exportEquipmentPDF', () => {
    it('should export equipment as PDF successfully', async () => {
      const mockEquipment = [
        {
          name: 'Test Equipment',
          type: 'VideoSwitcher',
          model: 'Test Model',
          serialNumber: 'SN123',
          status: 'AVAILABLE',
          location: 'Depo',
          responsibleUser: { name: 'Test User' },
        },
      ];

      (Equipment.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockEquipment),
        }),
      });

      await exportController.exportEquipmentPDF(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Equipment.find).toHaveBeenCalled();
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf'
      );
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=Ekipman-Listesi-export.pdf'
      );
    });
  });

  describe('exportProjectsExcel', () => {
    it('should export projects as Excel successfully', async () => {
      const mockProjects = [
        {
          name: 'Test Project',
          description: 'Test Description',
          client: { name: 'Test Client' },
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          status: 'ACTIVE',
          location: 'Istanbul',
        },
      ];

      (Project.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockProjects),
        }),
      });

      await exportController.exportProjectsExcel(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Project.find).toHaveBeenCalled();
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  });

  describe('exportDashboardPDF', () => {
    it('should export dashboard report as PDF successfully', async () => {
      (Equipment.countDocuments as jest.Mock)
        .mockResolvedValueOnce(10) // totalEquipment
        .mockResolvedValueOnce(5) // availableEquipment
        .mockResolvedValueOnce(3); // inUseEquipment

      (Project.countDocuments as jest.Mock)
        .mockResolvedValueOnce(8) // totalProjects
        .mockResolvedValueOnce(4) // activeProjects
        .mockResolvedValueOnce(2); // completedProjects

      const { Task } = require('../../models');
      (Task.countDocuments as jest.Mock)
        .mockResolvedValueOnce(15) // totalTasks
        .mockResolvedValueOnce(8) // openTasks
        .mockResolvedValueOnce(7); // completedTasks

      await exportController.exportDashboardPDF(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf'
      );
      expect(mockSetHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=dashboard-report.pdf'
      );
    });

    it('should handle errors when exporting dashboard PDF', async () => {
      (Equipment.countDocuments as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await exportController.exportDashboardPDF(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Export işlemi sırasında bir hata oluştu',
      });
    });
  });
});

