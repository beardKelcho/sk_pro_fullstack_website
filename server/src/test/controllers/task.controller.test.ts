import { Request, Response } from 'express';
import { getAllTasks } from '../../controllers/task.controller';
import { Task } from '../../models';

jest.mock('../../models', () => ({
  Task: {
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

describe('task.controller getAllTasks', () => {
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should apply search, pagination and filter params', async () => {
    const req = {
      query: {
        search: 'kamera',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedTo: 'user-1',
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
      .mockImplementationOnce(() => Promise.resolve([{ _id: 'task-1', title: 'Kamera kurulumu' }]));

    (Task.find as jest.Mock).mockReturnValue(queryChain);
    (Task.countDocuments as jest.Mock).mockResolvedValue(1);

    await getAllTasks(req, res);

    expect(Task.find).toHaveBeenCalledWith({
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assignedTo: 'user-1',
      $or: [
        { title: { $regex: 'kamera', $options: 'i' } },
        { description: { $regex: 'kamera', $options: 'i' } },
      ],
    });
    expect(queryChain.skip).toHaveBeenCalledWith(5);
    expect(queryChain.limit).toHaveBeenCalledWith(5);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
