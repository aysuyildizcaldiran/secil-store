'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  TextField,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ClearIcon from '@mui/icons-material/Clear'

interface FilterValue {
  value: string
  valueName: string | null
}

interface FilterData {
  id: string
  title: string
  values: FilterValue[]
  currency: string | null
  comparisonType: number
}

interface FilterResponse {
  status: number
  message: string
  data: FilterData[]
}

interface FilterPanelProps {
  collectionId: string
  token: string
  onFiltersChange: (filters: Record<string, { values: string[], comparisonType: number }>) => void
  filterData?: any[]
  loadingFilters?: boolean
}

export default function FilterPanel({ collectionId, token, onFiltersChange, filterData: propFilterData, loadingFilters }: FilterPanelProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [expandedFilters, setExpandedFilters] = useState<string[]>([])

    const filterData = propFilterData || []
  const loading = loadingFilters || false

  const handleFilterChange = (filterId: string, value: string, checked: boolean) => {
    setSelectedFilters(prev => {
      const currentValues = prev[filterId] || []
      let newValues: string[]
      
      if (checked) {
        newValues = [...currentValues, value]
      } else {
        newValues = currentValues.filter(v => v !== value)
      }
      
      const updated = {
        ...prev,
        [filterId]: newValues
      }
      
      if (newValues.length === 0) {
        delete updated[filterId]
      }
      
      return updated
    })
  }

  const handleClearFilters = () => {
    setSelectedFilters({})
  }

  const handleApplyFilters = () => {
    const formattedFilters: Record<string, { values: string[], comparisonType: number }> = {};
    
    Object.entries(selectedFilters).forEach(([filterId, values]) => {
      const filterInfo = filterData.find(f => f.id === filterId);
      formattedFilters[filterId] = {
        values,
        comparisonType: filterInfo?.comparisonType || 0
      };
    });
    
    onFiltersChange(formattedFilters)
  }

  const handleAccordionChange = (filterId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFilters(prev => 
      isExpanded 
        ? [...prev, filterId]
        : prev.filter(id => id !== filterId)
    )
  }

  const getFilterValueDisplay = (value: FilterValue) => {
    return value.valueName || value.value
  }

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
          <Typography ml={2}>Filtreler yükleniyor...</Typography>
        </Box>
      </Paper>
    )
  }



  if (filterData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="text.secondary" textAlign="center">
          {loading ? 'Filtreler yükleniyor...' : 'Filtre bulunamadı'}
        </Typography>
        {!loading && (
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
            Toplam {filterData.length} filtre kategorisi
          </Typography>
        )}
      </Paper>
    )
  }

    return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        p={2} 
        bgcolor="primary.main" 
        color="white"
        sx={{ flexShrink: 0 }}
      >
        <Typography variant="h6" fontWeight="bold">
          Filtreler
        </Typography>
        <Button
          startIcon={<ClearIcon />}
          onClick={handleClearFilters}
          variant="outlined"
          size="small"
          sx={{ 
            color: 'white', 
            borderColor: 'white',
            '&:hover': {
              borderColor: 'white',
              bgcolor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          Temizle
        </Button>
      </Box>


      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box p={2} borderBottom={1} borderColor="grey.200">
          <Typography variant="body2" color="text.secondary">
            Toplam {filterData.length} filtre kategorisi yüklendi
          </Typography>
        </Box>
        {filterData.map((filter) => (
          <Accordion
            key={filter.id}
            expanded={expandedFilters.includes(filter.id)}
            onChange={handleAccordionChange(filter.id)}
            sx={{
              '&:before': { display: 'none' },
              borderBottom: 1,
              borderColor: 'grey.200',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                '& .MuiAccordionSummary-content': {
                  margin: '8px 0',
                },
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <Typography fontWeight="medium">{filter.title}</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="caption" color="text.secondary">
                    ({filter.values.length} seçenek)
                  </Typography>
                  {selectedFilters[filter.id] && selectedFilters[filter.id].length > 0 && (
                    <Chip
                      label={selectedFilters[filter.id].length}
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1, px: 2 }}>
              {filter.comparisonType === 3 ? (
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {filter.values.map((value:any, index:any) => (
                      <TextField
                        key={value.value}
                        label={getFilterValueDisplay(value) ==="Büyüktür"? "Maximum Stok" : "Minimum Stok"}
                        type="number"
                        size="small"
                        sx={{ minWidth: 100, maxWidth: 150 }}
                        inputProps={{
                          min: 0,
                          step: 1
                        }}
                        value={selectedFilters[filter.id]?.[index] || ''}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const currentValues = selectedFilters[filter.id] || [];
                          const newValues = [...currentValues];
                          
                          if (inputValue) {
                            newValues[index] = inputValue;
                          } else {
                            newValues[index] = '';
                          }
                          
                          const filteredValues = newValues.filter(v => v !== '');
                          
                          if (filteredValues.length > 0) {
                            setSelectedFilters(prev => ({
                              ...prev,
                              [filter.id]: filteredValues
                            }));
                          } else {
                            setSelectedFilters(prev => {
                              const updated = { ...prev };
                              delete updated[filter.id];
                              return updated;
                            });
                          }
                        }}
                        placeholder="Değer giriniz"
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box display="flex" flexDirection="column" gap={0.5}>
                  {filter.values.map((value:any) => (
                    <FormControlLabel
                      key={value.value}
                      control={
                        <Checkbox
                          checked={selectedFilters[filter.id]?.includes(value.value) || false}
                          onChange={(e) => handleFilterChange(filter.id, value.value, e.target.checked)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {getFilterValueDisplay(value)}
                        </Typography>
                      }
                      sx={{ margin: 0 }}
                    />
                  ))}
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>


      <Box p={2} borderTop={1} borderColor="grey.200" sx={{ flexShrink: 0 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleApplyFilters}
          disabled={Object.keys(selectedFilters).length === 0}
          sx={{ fontWeight: 'bold', borderRadius: 2 }}
        >
          Filtreleri Uygula
        </Button>
      </Box>
    </Box>
  )
} 