/**
 * IFC API Module
 * 
 * API functions for IFC model management
 */

import { get, uploadFile, ApiError } from './client'
import type {
  IfcModel,
  IfcElement,
  IfcComparison,
  UploadIfcResponse,
} from './types'

// ============================================================================
// IFC MODEL MANAGEMENT
// ============================================================================

/**
 * Upload IFC file for a project
 * 
 * @param projectId - Project ID
 * @param file - IFC file to upload
 * @returns IFC model with processing status
 */
export async function uploadIfc(
  projectId: string,
  file: File
): Promise<UploadIfcResponse> {
  const formData = new FormData()
  formData.append('file', file)
  
  return uploadFile<UploadIfcResponse>(
    `/projects/${projectId}/ifc`,
    formData
  )
}

/**
 * Get IFC model for a project
 * 
 * @param projectId - Project ID
 * @returns IFC model if exists, null if not found
 */
export async function getProjectIfc(
  projectId: string
): Promise<IfcModel | null> {
  try {
    return await get<IfcModel>(`/projects/${projectId}/ifc`)
  } catch (error) {
    // Return null if IFC not found (404)
    if (error instanceof ApiError && error.code === 'NOT_FOUND') {
      return null
    }
    throw error
  }
}

/**
 * Get IFC elements list
 * 
 * @param ifcId - IFC model ID
 * @returns Array of IFC elements
 */
export async function getIfcElements(
  ifcId: string
): Promise<IfcElement[]> {
  try {
    return await get<IfcElement[]>(`/ifc/${ifcId}/elements`)
  } catch (error) {
    // Return empty array if not found
    if (error instanceof ApiError && error.code === 'NOT_FOUND') {
      return []
    }
    throw error
  }
}

/**
 * Get IFC comparisons (IFC vs Evidence)
 * 
 * @param projectId - Project ID
 * @returns Array of comparison results
 */
export async function getIfcComparisons(
  projectId: string
): Promise<IfcComparison[]> {
  try {
    return await get<IfcComparison[]>(`/projects/${projectId}/ifc/comparisons`)
  } catch (error) {
    // Return empty array if not found or not ready
    if (error instanceof ApiError && error.code === 'NOT_FOUND') {
      return []
    }
    throw error
  }
}
