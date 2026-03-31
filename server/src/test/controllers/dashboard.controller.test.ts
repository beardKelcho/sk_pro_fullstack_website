import { Request, Response } from 'express';
import { getDashboardStats } from '../../controllers/dashboard.controller';
import { Equipment, Project, Task, Client, Maintenance } from '../../models';

jest.mock('../../models', () => ({
  Equipment: {
    aggregate: jest.fn(),
  },
  Project: {
    aggregate: jest.fn(),
    find: jest.fn(),
  },
  Task: {
    aggregate: jest.fn(),
  },
  Client: {
    countDocuments: jest.fn(),
  },
  Maintenance: {
    find: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

describe('dashboard.controller getDashboardStats', () => {
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return aggregated stats with upcoming items', async () => {
    const req = {} as Request;
    const res = mockResponse();
    const upcomingMaintenances = [{ _id: 'maintenance-1' }];
    const upcomingProjects = [{ _id: 'project-1' }];

    (Equipment.aggregate as jest.Mock).mockResolvedValue([
      { total: 12, available: 8, inUse: 2, maintenance: 2 },
    ]);
    (Project.aggregate as jest.Mock).mockResolvedValue([
      { total: 5, active: 3, completed: 1 },
    ]);
    (Task.aggregate as jest.Mock).mockResolvedValue([
      { total: 9, open: 4, completed: 5 },
    ]);
    (Client.countDocuments as jest.Mock).mockResolvedValue(7);

    const maintenanceQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(upcomingMaintenances),
    };
    const projectQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(upcomingProjects),
    };

    (Maintenance.find as jest.Mock).mockReturnValue(maintenanceQuery);
    (Project.find as jest.Mock).mockReturnValue(projectQuery);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      stats: {
        equipment: {
          total: 12,
          available: 8,
          inUse: 2,
          maintenance: 2,
        },
        projects: {
          total: 5,
          active: 3,
          completed: 1,
        },
        tasks: {
          total: 9,
          open: 4,
          completed: 5,
        },
        clients: {
          total: 7,
          active: 7,
        },
      },
      upcomingMaintenances,
      upcomingProjects,
    });
  });

  it('should return 500 when a stats query fails', async () => {
    const req = {} as Request;
    const res = mockResponse();

    (Equipment.aggregate as jest.Mock).mockRejectedValue(new Error('DB down'));

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Dashboard istatistikleri alınırken bir hata oluştu',
    });
  });
});
