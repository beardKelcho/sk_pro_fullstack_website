import React from 'react';

interface InventoryLabelProps {
    serialNumber: string;
    inventoryName: string;
    brand?: string;
    qrData: string;
}

const InventoryLabel: React.FC<InventoryLabelProps> = ({
    serialNumber,
    inventoryName,
    brand,
    qrData,
}) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        @media print { 
          @page { 
            size: 60mm 30mm; 
            margin: 0; 
          } 
        }
      `,
                }}
            />

            <div
                className="flex w-[60mm] h-[30mm] overflow-hidden bg-white border border-gray-200 box-border"
                style={{ width: '60mm', height: '30mm' }}
            >
                {/* Sol Sütun (%38) */}
                <div className="w-[38%] flex flex-col items-center justify-center p-1 border-r border-gray-100">
                    <div className="w-full aspect-square flex items-center justify-center mb-0.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={qrUrl}
                            alt={`QR: ${serialNumber}`}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <span className="text-[7px] leading-none font-mono text-center break-all text-gray-800">
                        {serialNumber}
                    </span>
                </div>

                {/* Sağ Sütun (Esnek) */}
                <div className="flex-1 flex flex-col justify-between py-1.5 px-2 min-w-0">
                    <div className="text-[9px] font-bold uppercase leading-tight tracking-tight text-black">
                        SK Production
                    </div>

                    <div
                        className="text-[9px] leading-3 font-medium text-gray-900 overflow-hidden"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {inventoryName}
                    </div>

                    <div className="text-[7px] text-gray-500 italic leading-tight truncate">
                        {brand || ' '}
                    </div>
                </div>
            </div>
        </>
    );
};

export default InventoryLabel;
