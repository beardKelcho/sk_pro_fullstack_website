import { Request, Response } from 'express';
import { Equipment, Project, Task, Client, User, Maintenance } from '../models';
import logger from '../utils/logger';
import { addToSearchHistory } from './savedSearch.controller';

interface SearchResult {
  type: 'equipment' | 'project' | 'task' | 'client' | 'user' | 'maintenance';
  id: string;
  title: string;
  description?: string;
  metadata?: unknown;
}

// Global arama
export const globalSearch = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;
    const searchQuery = (q as string)?.trim();

    if (!searchQuery || searchQuery.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Arama sorgusu en az 2 karakter olmalıdır',
      });
    }

    const searchLimit = Math.min(parseInt(limit as string, 10), 50);
    const searchRegex = new RegExp(searchQuery, 'i');

    // Paralel aramalar
    const [
      equipmentResults,
      projectResults,
      taskResults,
      clientResults,
      userResults,
      maintenanceResults,
    ] = await Promise.all([
      // Ekipman araması
      Equipment.find({
        $or: [
          { name: searchRegex },
          { model: searchRegex },
          { serialNumber: searchRegex },
          { type: searchRegex },
        ],
      })
        .select('name model serialNumber type status location')
        .limit(searchLimit)
        .lean(),

      // Proje araması
      Project.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
        ],
      })
        .select('name description status location startDate endDate')
        .populate('client', 'name email')
        .limit(searchLimit)
        .lean(),

      // Görev araması
      Task.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
        ],
      })
        .select('title description status priority dueDate')
        .populate('assignedTo', 'name email')
        .populate('project', 'name')
        .limit(searchLimit)
        .lean(),

      // Müşteri araması
      Client.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { companyName: searchRegex },
        ],
      })
        .select('name email phone companyName address')
        .limit(searchLimit)
        .lean(),

      // Kullanıcı araması
      User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      })
        .select('name email phone role department')
        .limit(searchLimit)
        .lean(),

      // Bakım araması
      Maintenance.find({
        $or: [
          { description: searchRegex },
          { type: searchRegex },
        ],
      })
        .select('description type status scheduledDate priority')
        .populate('equipment', 'name type model')
        .populate('assignedTo', 'name email')
        .limit(searchLimit)
        .lean(),
    ]);

    // Sonuçları formatla
    const results: SearchResult[] = [];

    equipmentResults.forEach((item: unknown) => {
      results.push({
        type: 'equipment',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (item as any)._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (item as any).name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: `${(item as any).type} - ${(item as any).model || ''} ${(item as any).serialNumber ? `(${(item as any).serialNumber})` : ''}`.trim(),
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: (item as any).status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          location: (item as any).location,
        },
      });
    });

    projectResults.forEach((item: unknown) => {
      results.push({
        type: 'project',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (item as any)._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (item as any).name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (item as any).description || (item as any).location || '',
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: (item as any).status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          client: (item as any).client?.name || '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          startDate: (item as any).startDate,
        },
      });
    });

    taskResults.forEach((item: unknown) => {
      results.push({
        type: 'task',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (item as any)._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (item as any).title,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (item as any).description || '',
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: (item as any).status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          priority: (item as any).priority,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          assignedTo: (item as any).assignedTo?.name || '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          project: (item as any).project?.name || '',
        },
      });
    });

    clientResults.forEach((item: unknown) => {
      results.push({
        type: 'client',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (item as any)._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (item as any).name || (item as any).companyName,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (item as any).email || (item as any).phone || (item as any).address || '',
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          companyName: (item as any).companyName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (item as any).email,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          phone: (item as any).phone,
        },
      });
    });

    userResults.forEach((item: unknown) => {
      results.push({
        type: 'user',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (item as any)._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (item as any).name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (item as any).email || (item as any).role || '',
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: (item as any).role,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          department: (item as any).department,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email: (item as any).email,
        },
      });
    });

    maintenanceResults.forEach((item: unknown) => {
      results.push({
        type: 'maintenance',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (item as any)._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        title: (item as any).description || `${((item as any).equipment as any)?.name || ''} Bakımı`.trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        description: (item as any).type || '',
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: (item as any).status,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          priority: (item as any).priority,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          scheduledDate: (item as any).scheduledDate,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          equipment: ((item as any).equipment as any)?.name || '',
        },
      });
    });

    // Sonuçları kategorize et
    const categorized = {
      equipment: results.filter(r => r.type === 'equipment'),
      projects: results.filter(r => r.type === 'project'),
      tasks: results.filter(r => r.type === 'task'),
      clients: results.filter(r => r.type === 'client'),
      users: results.filter(r => r.type === 'user'),
      maintenance: results.filter(r => r.type === 'maintenance'),
    };

    // Arama geçmişine ekle (async, hata olsa bile devam et)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = req.user!._id;
    if (userId) {
      addToSearchHistory(userId.toString(), searchQuery, undefined, results.length).catch((err) =>
        logger.error('Arama geçmişi ekleme hatası:', err)
      );
    }

    res.status(200).json({
      success: true,
      query: searchQuery,
      total: results.length,
      results: categorized,
      all: results.slice(0, searchLimit), // İlk N sonuç
    });
  } catch (error) {
    logger.error('Global arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Arama yapılırken bir hata oluştu',
    });
  }
};

// Arama önerileri (autocomplete)
export const getSearchSuggestions = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const searchQuery = (q as string)?.trim();

    if (!searchQuery || searchQuery.length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: [],
      });
    }

    const searchRegex = new RegExp(searchQuery, 'i');
    const limit = 5;

    const [equipmentNames, projectNames, clientNames] = await Promise.all([
      Equipment.find({ name: searchRegex })
        .select('name')
        .limit(limit)
        .lean(),
      Project.find({ name: searchRegex })
        .select('name')
        .limit(limit)
        .lean(),
      Client.find({
        $or: [
          { name: searchRegex },
          { companyName: searchRegex },
        ],
      })
        .select('name companyName')
        .limit(limit)
        .lean(),
    ]);

    const suggestions: string[] = [];

    equipmentNames.forEach((item: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!suggestions.includes((item as any).name)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        suggestions.push((item as any).name);
      }
    });

    projectNames.forEach((item: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!suggestions.includes((item as any).name)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        suggestions.push((item as any).name);
      }
    });

    clientNames.forEach((item: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((item as any).name && !suggestions.includes((item as any).name)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        suggestions.push((item as any).name);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((item as any).companyName && !suggestions.includes((item as any).companyName)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        suggestions.push((item as any).companyName);
      }
    });

    res.status(200).json({
      success: true,
      suggestions: suggestions.slice(0, 10),
    });
  } catch (error) {
    logger.error('Arama önerileri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Arama önerileri alınırken bir hata oluştu',
    });
  }
};

