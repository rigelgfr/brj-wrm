export function standardizeTruckType(type: string): string {
  // Handle null, undefined, or empty strings
  if (!type || type.trim() === '' || type === '""') return "Unknown";
  
  const normalized = type.toUpperCase().trim().replace(/['"]/g, '');
  
  // Handle Wing Box variations
  if (normalized.includes('WING') || normalized === 'WB' || normalized === 'WINGBOX') return "Wing Box";
  
  // Handle 40ft variations
  if (normalized.includes('40') || normalized.includes('45')) return "40ft";
  
  // Handle 20ft variations
  if (normalized.includes('20')) return "20ft";

  
  // Handle specific truck types
  if (normalized === 'CDD') return "CDD";
  if (normalized === 'CDE') return "CDE";
  if (normalized.includes('TRONTON')) return "Tronton";
  if (normalized.includes('BOX')) return "Box";
  if (normalized === 'MOTOR') return "Motor";
  if (normalized === 'MOBIL') return "Mobil";
  if (normalized.match(/FLAT|FLATBED/)) return "Flatbed";
  if (normalized === 'FUSO') return "Fuso";
  
  // Handle any remaining unmatched patterns
  return "Unknown";
}