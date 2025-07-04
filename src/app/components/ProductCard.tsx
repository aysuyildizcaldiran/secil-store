'use client'
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import { CSS } from "@dnd-kit/utilities";

export default function ProductCard({
    product,
    listeners,
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
  }: any) {
    return (
      <Card
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        sx={{
          width: 150,
          height: 220,
          opacity: isDragging ? 0.5 : 1,
          transform: CSS.Transform.toString(transform),
          transition,
          cursor: 'move',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <CardMedia
            component="img"
            image={product.imgUrl}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
        <CardContent sx={{ textAlign: 'center', p: 1 }}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {product.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {product.productCode}
          </Typography>
        </CardContent>
      </Card>
    )
  }