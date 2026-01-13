'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ResponsiveGridLayout, LayoutItem, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
// resizable.css artık styles.css içinde dahil edilmiş olabilir, ayrı import gerekmiyor
import { Widget } from '@/services/widgetService';
import StatCardWidget from './StatCardWidget';
import PieChartWidget from './PieChartWidget';
import DonutChartWidget from './DonutChartWidget';
import LineChartWidget from './LineChartWidget';
import BarChartWidget from './BarChartWidget';
import { updateWidgetsBulk } from '@/services/widgetService';
import { trackApiError } from '@/utils/errorTracking';
import logger from '@/utils/logger';

interface WidgetContainerProps {
  widgets: Widget[];
  onWidgetsChange?: (widgets: Widget[]) => void;
  isEditable?: boolean;
  dashboardStats?: any;
  chartData?: any;
}

export default function WidgetContainer({
  widgets,
  onWidgetsChange,
  isEditable = false,
  dashboardStats,
  chartData,
}: WidgetContainerProps) {
  const [layouts, setLayouts] = useState<{ [key: string]: LayoutItem[] }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Container genişliğini güncelle
  useEffect(() => {
    const updateWidth = () => {
      const container = document.querySelector('.widget-container');
      if (container) {
        setContainerWidth(container.clientWidth || 1200);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Widget'ları layout formatına dönüştür - Stable key oluştur
  const widgetsKey = useMemo(() => {
    return widgets
      .filter(w => w.isVisible)
      .map(w => `${w._id}-${w.position?.x}-${w.position?.y}-${w.position?.w}-${w.position?.h}`)
      .join('|');
  }, [widgets]);

  const lgLayout = useMemo(() => {
    return widgets
      .filter(w => w.isVisible)
      .map(widget => ({
        i: widget._id || '',
        x: widget.position?.x ?? 0,
        y: widget.position?.y ?? 0,
        w: widget.position?.w ?? 4,
        h: widget.position?.h ?? 4,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 12,
        static: !isEditable, // Normal modda statik (sürüklenemez)
      }));
  }, [widgetsKey, isEditable]);

  // Layout'u sadece gerçekten değiştiğinde güncelle - useRef ile önceki değeri takip et
  const prevLayoutKeyRef = useRef<string>('');
  
  useEffect(() => {
    const currentLayoutKey = lgLayout.map(l => `${l.i}-${l.x}-${l.y}-${l.w}-${l.h}-${l.static}`).join('|');
    
    // Sadece gerçekten değiştiyse güncelle
    if (prevLayoutKeyRef.current !== currentLayoutKey) {
      prevLayoutKeyRef.current = currentLayoutKey;
      setLayouts({ lg: lgLayout });
    }
  }, [lgLayout]);

  // Layout değişikliğini handle et - Deep comparison ile optimize et
  const handleLayoutChange = useCallback(
    async (currentLayout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
      if (!isEditable) return;
      
      const lgLayout = (allLayouts.lg || currentLayout) as LayoutItem[];
      
      // Sadece drag/resize bittiğinde kaydet
      if (isDragging) {
        // Layout state'ini güncelle ama henüz kaydetme
        // Deep comparison yap - sadece gerçekten değiştiyse güncelle
        const currentLayoutItems = layouts.lg || [];
        const hasChanged = 
          currentLayoutItems.length !== lgLayout.length ||
          currentLayoutItems.some((item, index) => {
            const newItem = lgLayout[index];
            return !newItem || 
              item.i !== newItem.i ||
              item.x !== newItem.x ||
              item.y !== newItem.y ||
              item.w !== newItem.w ||
              item.h !== newItem.h;
          });
        
        if (hasChanged) {
          setLayouts({ lg: lgLayout });
        }
        return;
      }

      // Widget'ları güncelle
      const updatedWidgets = widgets.map(widget => {
        const layoutItem = lgLayout.find(l => l.i === widget._id);
        if (layoutItem) {
          return {
            ...widget,
            position: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return widget;
      });

      // Sıralamayı güncelle (y pozisyonuna göre)
      updatedWidgets.sort((a, b) => {
        if (a.position.y !== b.position.y) {
          return a.position.y - b.position.y;
        }
        return a.position.x - b.position.x;
      });

      updatedWidgets.forEach((widget, index) => {
        widget.order = index;
      });

      if (onWidgetsChange) {
        onWidgetsChange(updatedWidgets);
      }

      // Backend'e kaydet (sadece drag/resize bittiğinde)
      try {
        await updateWidgetsBulk(
          updatedWidgets.map(w => ({
            id: w._id!,
            position: w.position,
            order: w.order,
          }))
        );
      } catch (error: any) {
        trackApiError(error, '/widgets/bulk', 'PUT');
        logger.error('Widget pozisyonları kaydedilemedi:', error);
      }
    },
    [widgets, isEditable, isDragging, onWidgetsChange, layouts.lg]
  );

  // Widget render et - Memoize et
  const renderWidget = useCallback((widget: Widget) => {
    const commonProps = {
      widget,
      dashboardStats,
      chartData,
      isEditable, // Edit modu bilgisini widget'lara geçir
    };

    switch (widget.type) {
      case 'STAT_CARD':
        return <StatCardWidget key={widget._id} {...commonProps} />;
      case 'PIE_CHART':
        return <PieChartWidget key={widget._id} {...commonProps} />;
      case 'DONUT_CHART':
        return <DonutChartWidget key={widget._id} {...commonProps} />;
      case 'LINE_CHART':
        return <LineChartWidget key={widget._id} {...commonProps} />;
      case 'BAR_CHART':
        return <BarChartWidget key={widget._id} {...commonProps} />;
      default:
        return (
          <div key={widget._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <p className="text-gray-500">Bilinmeyen widget tipi: {widget.type}</p>
          </div>
        );
    }
  }, [dashboardStats, chartData, isEditable]);

  // Widget'ları sırala - sadece render için
  const sortedWidgets = useMemo(() => {
    return [...widgets]
      .filter(w => w.isVisible)
      .sort((a, b) => {
        // Yerleşim sırasına göre sırala (y pozisyonu, sonra x pozisyonu)
        const aY = a.position?.y ?? 0;
        const bY = b.position?.y ?? 0;
        if (aY !== bY) {
          return aY - bY;
        }
        return (a.position?.x ?? 0) - (b.position?.x ?? 0);
      });
  }, [widgetsKey]);

  return (
    <div className="widget-container" style={{ position: 'relative', width: '100%' }}>
      <ResponsiveGridLayout
        className="layout"
        width={containerWidth}
        layouts={layouts}
        {...(isEditable ? { onLayoutChange: handleLayoutChange } : {})}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        preventCollision={!isEditable}
        compactType={isEditable ? undefined : null}
        isDraggable={isEditable}
        isResizable={isEditable}
        static={!isEditable}
        {...(isEditable ? {
          onDragStart: () => setIsDragging(true),
          onDragStop: () => {
            setIsDragging(false);
          },
          onResizeStart: () => setIsDragging(true),
          onResizeStop: () => {
            setIsDragging(false);
          },
          draggableHandle: ".widget-drag-handle",
        } : {})}
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {sortedWidgets.map(widget => (
          <div 
            key={widget._id || `widget-${widget.type}-${widget.order || 0}`}
            className="widget-wrapper"
            style={!isEditable ? { 
              pointerEvents: 'auto',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none',
              cursor: 'default',
            } : {}}
            data-grid={{ 
              x: widget.position?.x ?? 0, 
              y: widget.position?.y ?? 0, 
              w: widget.position?.w ?? 4, 
              h: widget.position?.h ?? 4,
              static: !isEditable 
            }}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}

