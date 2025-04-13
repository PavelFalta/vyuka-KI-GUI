import { useState, useEffect, useCallback } from 'react';
import { useApiClient } from '../useApiClient';
import { 
  CategoryResponse, 
  CategoryCreate, 
  CategoryUpdate 
} from '../../api/models';

interface UseCategoriesResult { 
  categories: CategoryResponse[]; 
  isLoading: boolean; 
  error: string | null; 
  
  refreshCategories: () => Promise<CategoryResponse[]>;
  
  createCategory: (categoryData: CategoryCreate) => Promise<CategoryResponse>; 
  updateCategory: (categoryId: number, categoryData: CategoryUpdate) => Promise<void>; 
  deleteCategory: (categoryId: number) => Promise<void>; 
  getCategoryById: (categoryId: number) => CategoryResponse | undefined; 
}

export const useCategories = (): UseCategoriesResult => { 
  const apiClient = useApiClient(); 
  
  const [categories, setCategories] = useState<CategoryResponse[]>([]); 
  
  const [isLoading, setIsLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  
  const refreshCategories = useCallback(async () => { 
    setIsLoading(true); 
    try {
      const data = await apiClient.categories.getCategories(); 
      setCategories(data); 
      setError(null); 
      return data; 
    } catch (err) { 
      console.error('Error fetching categories:', err); 
      setError('Failed to load categories'); 
      return []; 
    } finally {
      setIsLoading(false); 
    }
  }, [apiClient.categories]); 
  
  const createCategory = useCallback(async (categoryData: CategoryCreate): Promise<CategoryResponse> => { 
    try {
      const newCategory = await apiClient.categories.createCategories({ 
        categoryCreate: categoryData 
      });
      
      setCategories(prevCategories => { 
        if (!prevCategories.some(c => c.categoryId === newCategory.categoryId)) { 
          return [...prevCategories, newCategory]; 
        }
        return prevCategories; 
      });
      
      return newCategory; 
    } catch (err) { 
      console.error('Error creating category:', err); 
      setError('Failed to create category'); 
      throw err; 
    }
  }, [apiClient.categories]); 

  const updateCategory = useCallback(async (categoryId: number, categoryData: CategoryUpdate): Promise<void> => { 
    try {
      await apiClient.categories.updateCategory({ 
        categoryId, 
        categoryUpdate: categoryData 
      });
      
      const updatedCategory = await apiClient.categories.getCategory({ categoryId }); 
      
      setCategories(prevCategories => 
        prevCategories.map(category => 
          category.categoryId === categoryId 
            ? updatedCategory 
            : category 
        )
      );
    } catch (err) { 
      console.error('Error updating category:', err); 
      setError('Failed to update category'); 
      throw err; 
    }
  }, [apiClient.categories]); 

  const deleteCategory = useCallback(async (categoryId: number): Promise<void> => { 
    try {
      await apiClient.categories.deleteCategory({ 
        categoryId 
      });
      
      setCategories(prevCategories => 
        prevCategories.filter(category => category.categoryId !== categoryId) 
      );
    } catch (err) { 
      console.error('Error deleting category:', err); 
      setError('Failed to delete category'); 
      throw err; 
    }
  }, [apiClient.categories]); 

  const getCategoryById = useCallback((categoryId: number): CategoryResponse | undefined => { 
    return categories.find(category => category.categoryId === categoryId); 
  }, [categories]); 
  
  useEffect(() => { 
    refreshCategories(); 
  }, [refreshCategories]); 
  
  return {
    categories, 
    isLoading, 
    error, 
    
    refreshCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    getCategoryById 
  };
}; 