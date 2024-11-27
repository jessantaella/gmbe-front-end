import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})

export class GestionDatosGMBEService {
    private categorias: { idCategoria: number; descripcion: string; complemento: string }[] = [];
    private subcategorias: { idCategoria: number; idSubcategoria: number; descripcion: string; complemento: string }[] = [];
  
    // Funciones para Categorías
    agregarCategoria(idCategoria: number, descripcion: string, complemento: string): void {
      this.categorias.push({ idCategoria, descripcion, complemento });
    }
  
    modificarCategoria(idCategoria: number, descripcion: string, complemento: string): boolean {
      const categoria = this.categorias.find(cat => cat.idCategoria === idCategoria);
      if (categoria) {
        categoria.descripcion = descripcion;
        categoria.complemento = complemento;
        return true;
      }
      return false;
    }
  
    eliminarCategoria(idCategoria: number): boolean {
      const index = this.categorias.findIndex(cat => cat.idCategoria === idCategoria);
      if (index !== -1) {
        this.categorias.splice(index, 1);
        return true;
      }
      return false;
    }
  
    buscarCategoriaPorId(idCategoria: number): { idCategoria: number; descripcion: string; complemento: string } | undefined {
      return this.categorias.find(cat => cat.idCategoria === idCategoria);
    }
  
    obtenerTodasLasCategorias(): { idCategoria: number; descripcion: string; complemento: string }[] {
      return [...this.categorias];
    }
  
    // Funciones para Subcategorías
    agregarSubcategoria(
      idCategoria: number,
      idSubcategoria: number,
      descripcion: string,
      complemento: string
    ): void {
      this.subcategorias.push({ idCategoria, idSubcategoria, descripcion, complemento });
    }
  
    modificarSubcategoria(
      idCategoria: number,
      idSubcategoria: number,
      descripcion: string,
      complemento: string
    ): boolean {
      const subcategoria = this.subcategorias.find(
        sub => sub.idCategoria === idCategoria && sub.idSubcategoria === idSubcategoria
      );
      if (subcategoria) {
        subcategoria.descripcion = descripcion;
        subcategoria.complemento = complemento;
        return true;
      }
      return false;
    }
  
    eliminarSubcategoria(idCategoria: number, idSubcategoria: number): boolean {
      const index = this.subcategorias.findIndex(
        sub => sub.idCategoria === idCategoria && sub.idSubcategoria === idSubcategoria
      );
      if (index !== -1) {
        this.subcategorias.splice(index, 1);
        return true;
      }
      return false;
    }
  
    buscarSubcategoriaPorId(idSubcategoria:number): { idCategoria: number; idSubcategoria: number; descripcion: string; complemento: string } | undefined {
      return this.subcategorias.find(
        sub => sub.idSubcategoria === idSubcategoria
      );
    }
  
    obtenerTodasLasSubcategorias(): { idCategoria: number; idSubcategoria: number; descripcion: string; complemento: string }[] {
      return [...this.subcategorias];
    }
  }
  