import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Environment değişkenlerini yapılandır
dotenv.config();

// Express app oluştur
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ana route
app.get('/', (req, res) => {
  res.send('SK Production API çalışıyor.');
});

// Port
const PORT = process.env.PORT || 5000;

// MongoDB bağlantısı ve Sunucu başlatma
const startServer = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/skproduction';
    await mongoose.connect(MONGO_URI);
    
    console.log('MongoDB veritabanına bağlandı');
    
    app.listen(PORT, () => {
      console.log(`Sunucu port ${PORT} üzerinde çalışıyor`);
    });
  } catch (error) {
    console.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
};

startServer(); 