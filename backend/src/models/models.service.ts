import { Injectable } from '@nestjs/common';
import { MODELS_DATA } from './models.data';

@Injectable()
export class ModelsService {
  findAll(query: { search?: string; type?: string; lab?: string; maxPrice?: number }) {
    let result = [...MODELS_DATA];
    if (query.search) {
      const s = query.search.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(s) || m.desc.toLowerCase().includes(s) || m.org.toLowerCase().includes(s));
    }
    if (query.type) result = result.filter(m => m.types.includes(query.type!));
    if (query.lab) result = result.filter(m => m.lab === query.lab);
    if (query.maxPrice !== undefined) result = result.filter(m => m.price_start <= query.maxPrice!);
    return result;
  }

  findOne(id: string) {
    return MODELS_DATA.find(m => m.id === id) || null;
  }
}
