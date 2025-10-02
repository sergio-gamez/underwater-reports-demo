import { supabase } from './supabase'
import type { FeedbackData } from '../types/analysis'

export class FeedbackService {
  // Save feedback to Supabase
  static async saveFeedback(feedbackData: FeedbackData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('feedback')
        .upsert({
          assessment_id: feedbackData.assessmentId,
          title: feedbackData.title,
          rating: feedbackData.rating,
          comment: feedbackData.comment || null,
          user_id: feedbackData.userId,
          item_data: feedbackData.itemData,
          deleted_at: null,    // Clear soft delete when saving new feedback
          deleted_by: null     // Clear deleted_by when saving new feedback
        }, {
          onConflict: 'assessment_id,title,user_id'
        })

      if (error) {
        console.error('Error saving feedback:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error saving feedback:', error)
      return { success: false, error: 'Failed to save feedback' }
    }
  }

  // Soft delete feedback from Supabase by assessment, title, and user (user can only delete their own)
  static async removeFeedback(assessmentId: string, title: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: userId
        })
        .filter('assessment_id', 'eq', assessmentId)
        .filter('title', 'eq', title)
        .filter('user_id', 'eq', userId)
        .filter('deleted_at', 'is', null) // Only update non-deleted records

      if (error) {
        console.error('Error soft deleting feedback:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error soft deleting feedback:', error)
      return { success: false, error: 'Failed to remove feedback' }
    }
  }

  // Soft delete feedback from Supabase by ID (for admin/management use)
  static async removeFeedbackById(feedbackId: string, deletedBy: string = 'admin'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: deletedBy
        })
        .eq('id', feedbackId)
        .filter('deleted_at', 'is', null) // Only update non-deleted records

      if (error) {
        console.error('Error soft deleting feedback:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error soft deleting feedback:', error)
      return { success: false, error: 'Failed to remove feedback' }
    }
  }

  // Get feedback by assessment, title, and user (user-specific for assessment view)
  static async getFeedback(assessmentId: string, title: string, userId: string): Promise<FeedbackData | null> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .filter('assessment_id', 'eq', assessmentId)
        .filter('title', 'eq', title)
        .filter('user_id', 'eq', userId)
        .filter('deleted_at', 'is', null) // Exclude soft-deleted records
        .maybeSingle()

      if (error) {
        console.error('Error getting feedback:', error)
        return null
      }

      if (!data) return null

      // Convert Supabase row to FeedbackData format
      return {
        id: data.id,
        assessmentId: data.assessment_id,
        title: data.title,
        rating: data.rating as 'positive' | 'negative',
        comment: data.comment || undefined,
        timestamp: data.timestamp,
        userId: data.user_id,
        itemData: data.item_data
      }
    } catch (error) {
      console.error('Error getting feedback:', error)
      return null
    }
  }

  // Get all feedback (excluding soft-deleted)
  static async getAllFeedback(): Promise<FeedbackData[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .filter('deleted_at', 'is', null) // Exclude soft-deleted records
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error getting all feedback:', error)
        return []
      }

      // Convert Supabase rows to FeedbackData format
      return data.map(row => ({
        id: row.id,
        assessmentId: row.assessment_id,
        title: row.title,
        rating: row.rating as 'positive' | 'negative',
        comment: row.comment || undefined,
        timestamp: row.timestamp,
        userId: row.user_id,
        itemData: row.item_data
      }))
    } catch (error) {
      console.error('Error getting all feedback:', error)
      return []
    }
  }

  // Get feedback by assessment ID (excluding soft-deleted)
  static async getFeedbackByAssessment(assessmentId: string): Promise<FeedbackData[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('assessment_id', assessmentId)
        .filter('deleted_at', 'is', null) // Exclude soft-deleted records
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error getting feedback by assessment:', error)
        return []
      }

      // Convert Supabase rows to FeedbackData format
      return data.map(row => ({
        id: row.id,
        assessmentId: row.assessment_id,
        title: row.title,
        rating: row.rating as 'positive' | 'negative',
        comment: row.comment || undefined,
        timestamp: row.timestamp,
        userId: row.user_id,
        itemData: row.item_data
      }))
    } catch (error) {
      console.error('Error getting feedback by assessment:', error)
      return []
    }
  }

  // Admin methods for managing soft-deleted records

  // Get all feedback including soft-deleted (admin only)
  static async getAllFeedbackIncludingDeleted(): Promise<FeedbackData[]> {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('timestamp', { ascending: false })

      if (error) {
        console.error('Error getting all feedback including deleted:', error)
        return []
      }

      // Convert Supabase rows to FeedbackData format
      return data.map(row => ({
        id: row.id,
        assessmentId: row.assessment_id,
        title: row.title,
        rating: row.rating as 'positive' | 'negative',
        comment: row.comment || undefined,
        timestamp: row.timestamp,
        userId: row.user_id,
        itemData: row.item_data
      }))
    } catch (error) {
      console.error('Error getting all feedback including deleted:', error)
      return []
    }
  }

  // Restore soft-deleted feedback by ID (admin only)
  static async restoreFeedbackById(feedbackId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', feedbackId)
        .filter('deleted_at', 'not.is', null) // Only restore deleted records

      if (error) {
        console.error('Error restoring feedback:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error restoring feedback:', error)
      return { success: false, error: 'Failed to restore feedback' }
    }
  }
} 