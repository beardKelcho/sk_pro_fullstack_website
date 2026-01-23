/**
 * Aggregation Pipeline Optimizer
 * MongoDB aggregation pipeline'larını optimize etmek için utility fonksiyonları
 */

import mongoose from 'mongoose';
import logger from './logger';

/**
 * Aggregation pipeline'ı optimize eder
 * - Gereksiz stage'leri kaldırır
 * - Index kullanımını optimize eder
 * - Memory kullanımını azaltır
 * 
 * @param pipeline - Optimize edilecek pipeline
 * @param options - Optimizasyon seçenekleri
 * @returns Optimize edilmiş pipeline
 */
export const optimizeAggregation = (
  pipeline: any[],
  _options: {
    allowDiskUse?: boolean;
    explain?: boolean;
    hint?: any;
  } = {}
): any[] => {
  const optimized: any[] = [];
  let hasMatch = false;
  let hasSort = false;
  let hasLimit = false;

  for (let i = 0; i < pipeline.length; i++) {
    const stage = pipeline[i];
    const stageKey = Object.keys(stage)[0];

    // $match stage'ini mümkün olduğunca erken taşı
    if (stageKey === '$match' && !hasMatch) {
      optimized.unshift(stage); // En başa ekle
      hasMatch = true;
      continue;
    }

    // $sort ve $limit'i birleştir (MongoDB optimize eder)
    if (stageKey === '$sort' && !hasSort) {
      hasSort = true;
      optimized.push(stage);

      // Sonraki stage $limit ise birleştir
      if (i + 1 < pipeline.length && pipeline[i + 1].$limit) {
        optimized.push(pipeline[i + 1]);
        hasLimit = true;
        i++; // $limit'i atla
        continue;
      }
      continue;
    }

    // $limit zaten $sort ile birleştirildiyse atla
    if (stageKey === '$limit' && hasLimit) {
      continue;
    }

    // $project stage'inde sadece gerekli alanları tut
    if (stageKey === '$project') {
      const projectStage = optimizeProjectStage(stage.$project);
      if (Object.keys(projectStage).length > 0) {
        optimized.push({ $project: projectStage });
      }
      continue;
    }

    // Diğer stage'leri olduğu gibi ekle
    optimized.push(stage);
  }

  // $match yoksa ve ilk stage'de filtreleme yapılabiliyorsa ekle
  if (!hasMatch && optimized.length > 0) {
    const firstStage = optimized[0];
    const firstKey = Object.keys(firstStage)[0];

    // $group veya $lookup'tan önce $match eklenebilir
    if (firstKey === '$group' || firstKey === '$lookup') {
      // İlk stage'e göre $match eklenebilir (opsiyonel)
    }
  }

  return optimized;
};

/**
 * $project stage'ini optimize eder
 * Sadece gerekli alanları tutar
 */
const optimizeProjectStage = (project: any): any => {
  const optimized: any = {};

  for (const [key, value] of Object.entries(project)) {
    // 0 (exclude) değerleri atla (zaten exclude edilmiş)
    if (value === 0 || value === false) {
      continue;
    }

    // 1 (include) veya expression'ları ekle
    optimized[key] = value;
  }

  return optimized;
};

/**
 * Aggregation pipeline'ı explain eder ve performans analizi yapar
 */
export const explainAggregation = async (
  model: mongoose.Model<any>,
  pipeline: any[],
  _options: {
    allowDiskUse?: boolean;
    hint?: any;
  } = {}
): Promise<any> => {
  try {
    const explainResult = await model.aggregate(pipeline).explain('executionStats');

    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_QUERIES === 'true') {
      logger.debug('Aggregation Explain:', {
        stages: explainResult.stages || [],
        executionStats: explainResult.executionStats,
        queryPlanner: explainResult.queryPlanner,
      });
    }

    return explainResult;
  } catch (error) {
    logger.error('Aggregation explain error:', error);
    return null;
  }
};

/**
 * Aggregation pipeline'ı index kullanımı için optimize eder
 * $match stage'lerinde kullanılan alanlar için index önerileri verir
 */
export const suggestIndexesForAggregation = (pipeline: any[]): string[] => {
  const suggestions: string[] = [];
  const matchFields: Set<string> = new Set();
  const sortFields: Set<string> = new Set();

  for (const stage of pipeline) {
    // $match stage'lerindeki alanları topla
    if (stage.$match) {
      for (const field of Object.keys(stage.$match)) {
        matchFields.add(field);
      }
    }

    // $sort stage'lerindeki alanları topla
    if (stage.$sort) {
      for (const field of Object.keys(stage.$sort)) {
        sortFields.add(field);
      }
    }
  }

  // $match ve $sort alanlarını birleştirerek index öner
  if (matchFields.size > 0 || sortFields.size > 0) {
    const allFields = Array.from(new Set([...matchFields, ...sortFields]));

    // Compound index öner (match alanları + sort alanları)
    if (allFields.length > 0) {
      suggestions.push(`Compound index: ${allFields.join(', ')}`);
    }
  }

  return suggestions;
};

/**
 * Aggregation pipeline'ı memory kullanımı için optimize eder
 * Büyük veri setleri için allowDiskUse ve cursor kullanımını önerir
 */
export const optimizeForMemory = (
  pipeline: any[],
  estimatedDataSize: number = 0
): { pipeline: any[]; options: any } => {
  const options: any = {};

  // Büyük veri setleri için allowDiskUse öner
  if (estimatedDataSize > 100 * 1024 * 1024) { // 100MB
    options.allowDiskUse = true;
  }

  // $group stage'lerinde memory kullanımını azalt
  const optimized = pipeline.map(stage => {
    if (stage.$group) {
      // $group içinde gereksiz alanları kaldır
      const optimizedGroup: any = {};
      for (const [key, value] of Object.entries(stage.$group)) {
        // Sadece gerekli aggregation operatörlerini tut
        if (typeof value === 'object' && value !== null) {
          optimizedGroup[key] = value;
        }
      }
      return { $group: optimizedGroup };
    }
    return stage;
  });

  return { pipeline: optimized, options };
};

/**
 * Aggregation pipeline'ı batch processing için optimize eder
 * Büyük sonuç setleri için cursor kullanımını sağlar
 */
export const optimizeForBatchProcessing = (
  pipeline: any[],
  batchSize: number = 1000
): any[] => {
  // $limit yoksa batch size ekle
  const hasLimit = pipeline.some(stage => stage.$limit);
  if (!hasLimit) {
    pipeline.push({ $limit: batchSize });
  }

  return pipeline;
};
