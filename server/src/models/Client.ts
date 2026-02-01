import mongoose, { Schema, Document } from 'mongoose';

export interface IContact {
  name: string;
  phone: string;
  email: string;
  role: string;
}

export interface IClient extends Document {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  contacts: IContact[];
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  company: { type: String },
  address: { type: String },
  contacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    role: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model<IClient>('Client', ClientSchema);