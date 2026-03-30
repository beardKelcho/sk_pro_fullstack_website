import { Request, Response } from 'express';
import userController from '../../controllers/user.controller';
import userService from '../../services/user.service';

jest.mock('../../services/user.service');
jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
}));

describe('UserController', () => {
  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass parsed filters to userService.listUsers', async () => {
    const req = {
      query: {
        page: '2',
        limit: '25',
        sort: 'name',
        search: 'ali',
        role: 'TEKNISYEN',
        isActive: 'true',
      },
      user: {
        role: 'ADMIN',
      },
    } as unknown as Request;
    const res = mockResponse();

    (userService.listUsers as jest.Mock).mockResolvedValue({
      users: [],
      total: 0,
      page: 2,
      totalPages: 0,
    });

    await userController.getAllUsers(req, res);

    expect(userService.listUsers).toHaveBeenCalledWith(
      2,
      25,
      'name',
      'ali',
      'TEKNISYEN',
      undefined,
      true
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
