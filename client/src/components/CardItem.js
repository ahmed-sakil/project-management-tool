import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CardItem = ({ card }) => {
    const uniqueId = `card-${card.id}`;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: uniqueId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab', 
        touchAction: 'none', 
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners} 
            className="card card-body mb-2 shadow-sm"
        >
            {card.title}
        </div>
    );
};

export default CardItem;