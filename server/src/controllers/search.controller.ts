import { Request, Response } from 'express';
import { Equipment, Project, Task, Client, User, Maintenance } from '../models';
import logger from '../utils/logger';
import { addToSearchHistory } from './savedSearch.controller';

interface SearchResult {
  type: 'equipment' | 'project' | 'task' | 'client' | 'user' | 'maintenance';
  id: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
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

    equipmentResults.forEach((item: any) => {
      results.push({
        type: 'equipment',
        id: item._id.toString(),
        title: item.name,
        description: `${item.type} - ${item.model || ''} ${item.serialNumber ? `(${item.serialNumber})` : ''}`.trim(),
        metadata: {
          status: item.status,
          location: item.location,
        },
      });
    });

    projectResults.forEach((item: any) => {
      results.push({
        type: 'project',
        id: item._id.toString(),
        title: item.name,
        description: item.description || item.location || '',
        metadata: {
          status: item.status,
          client: item.client?.name || '',
          startDate: item.startDate,
        },
      });
    });

    taskResults.forEach((item: any) => {
      results.push({
        type: 'task',
        id: item._id.toString(),
        title: item.title,
        description: item.description || '',
        metadata: {
          status: item.status,
          priority: item.priority,
          assignedTo: item.assignedTo?.name || '',
          project: item.project?.name || '',
        },
      });
    });

    clientResults.forEach((item: any) => {
      results.push({
        type: 'client',
        id: item._id.toString(),
        title: item.name || item.companyName,
        description: item.email || item.phone || item.address || '',
        metadata: {
          companyName: item.companyName,
          email: item.email,
          phone: item.phone,
        },
      });
    });

    userResults.forEach((item: any) => {
      results.push({
        type: 'user',
        id: item._id.toString(),
        title: item.name,
        description: item.email || item.role || '',
        metadata: {
          role: item.role,
          department: item.department,
          email: item.email,
        },
      });
    });

    maintenanceResults.forEach((item: any) => {
      results.push({
        type: 'maintenance',
        id: item._id.toString(),
        title: item.description || `${item.equipment?.name || ''} Bakımı`.trim(),
        description: item.type || '',
        metadata: {
          status: item.status,
          priority: item.priority,
          scheduledDate: item.scheduledDate,
          equipment: item.equipment?.name || '',
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
    const userId = (req.user as any)?.id || (req.user as any)?._id;
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

    equipmentNames.forEach((item: any) => {
      if (!suggestions.includes(item.name)) {
        suggestions.push(item.name);
      }
    });

    projectNames.forEach((item: any) => {
      if (!suggestions.includes(item.name)) {
        suggestions.push(item.name);
      }
    });

    clientNames.forEach((item: any) => {
      if (item.name && !suggestions.includes(item.name)) {
        suggestions.push(item.name);
      }
      if (item.companyName && !suggestions.includes(item.companyName)) {
        suggestions.push(item.companyName);
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

