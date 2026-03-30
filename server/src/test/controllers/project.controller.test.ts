import { Request, Response } from 'express';
import projectController from '../../controllers/project.controller';
import projectService from '../../services/project.service';

jest.mock('../../services/project.service');
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

describe('ProjectController', () => {
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass dateScope and filters to projectService.listProjects', async () => {
    const req = {
      query: {
        page: '3',
        limit: '15',
        sort: '-createdAt',
        search: 'festival',
        status: 'ACTIVE',
        client: 'client-1',
        dateScope: 'upcoming',
      },
    } as unknown as Request;
    const res = mockResponse();

    (projectService.listProjects as jest.Mock).mockResolvedValue({
      projects: [],
      total: 0,
      page: 3,
      totalPages: 0,
    });

    await projectController.getAllProjects(req, res);

    expect(projectService.listProjects).toHaveBeenCalledWith(
      3,
      15,
      '-createdAt',
      'festival',
      'ACTIVE',
      'client-1',
      'upcoming'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
