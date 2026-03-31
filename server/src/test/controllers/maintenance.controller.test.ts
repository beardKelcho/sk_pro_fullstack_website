import { Request, Response } from 'express';
import { getAllMaintenances } from '../../controllers/maintenance.controller';
import { Equipment, Maintenance } from '../../models';

jest.mock('../../models', () => ({
  Equipment: {
    find: jest.fn(),
  },
  Maintenance: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

describe('maintenance.controller getAllMaintenances', () => {
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply search, priority, pagination and status/type filters', async () => {
    const req = {
      query: {
        search: 'kamera',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        type: 'REPAIR',
        page: '2',
        limit: '5',
      },
    } as unknown as Request;
    const res = mockResponse();
    const queryChain = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn(),
    };

    queryChain.populate
      .mockImplementationOnce(() => queryChain)
      .mockImplementationOnce(() => Promise.resolve([{ _id: 'maintenance-1', description: 'Kamera bakimi' }]));

    const equipmentQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: 'equipment-1' }]),
    };

    (Equipment.find as jest.Mock).mockReturnValue(equipmentQuery);
    (Maintenance.find as jest.Mock).mockReturnValue(queryChain);
    (Maintenance.countDocuments as jest.Mock).mockResolvedValue(1);

    await getAllMaintenances(req, res);

    expect(Equipment.find).toHaveBeenCalledWith({ name: /kamera/i });
    expect(equipmentQuery.select).toHaveBeenCalledWith('_id');
    expect(Maintenance.find).toHaveBeenCalledWith({
      status: 'IN_PROGRESS',
      type: 'REPAIR',
      priority: 'HIGH',
      $or: [
        { description: /kamera/i },
        { equipment: { $in: ['equipment-1'] } },
      ],
    });
    expect(queryChain.skip).toHaveBeenCalledWith(5);
    expect(queryChain.limit).toHaveBeenCalledWith(5);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
