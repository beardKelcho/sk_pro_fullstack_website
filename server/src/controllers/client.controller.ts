import { Request, Response } from 'express';
import Client from '../models/Client';

export const getClients = async (req: Request, res: Response) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Müşteriler getirilemedi', error });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Müşteri bulunamadı' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: 'Oluşturma hatası', error });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ message: 'Müşteri bulunamadı' });
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: 'Güncelleme hatası', error });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Müşteri bulunamadı' });
    res.json({ message: 'Müşteri silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Silme hatası', error });
  }
};
